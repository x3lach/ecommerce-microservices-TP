package com.ecommerce.commandeservice.service;


import com.ecommerce.commandeservice.config.AppConfig; // <-- Import
import com.ecommerce.commandeservice.dto.OrderCreatedEvent; // <-- Import
import com.ecommerce.commandeservice.dto.ProductResponse;
import com.ecommerce.commandeservice.model.*;
import com.ecommerce.commandeservice.repository.CartRepository;
import com.ecommerce.commandeservice.repository.OrderRepository;
import org.slf4j.Logger; // <-- Import
import org.slf4j.LoggerFactory; // <-- Import
import org.springframework.amqp.rabbit.core.RabbitTemplate; // <-- Import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List; // <-- Import
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final RestTemplate restTemplate;
    private final RabbitTemplate rabbitTemplate; // <-- ADD THIS

    private static final Logger log = LoggerFactory.getLogger(OrderService.class); // <-- ADD THIS

    // UPDATED CONSTRUCTOR
    public OrderService(OrderRepository orderRepository, CartService cartService,
                        CartRepository cartRepository, RestTemplate restTemplate,
                        RabbitTemplate rabbitTemplate) { // <-- Add RabbitTemplate
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.cartRepository = cartRepository;
        this.restTemplate = restTemplate;
        this.rabbitTemplate = rabbitTemplate; // <-- ADD THIS
    }

    @Transactional
    public Order createOrder(UUID userId) {
        // 1. Get the user's cart
        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot create order: Cart is empty.");
        }

        // 2. Validate stock for every item in the cart
        for (CartItem item : cart.getItems()) {
            ProductResponse product = getProductDetails(item.getProductId());
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalStateException("Not enough stock for product: " + product.getName());
            }
        }

        // 3. Create the Order
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus("CONFIRMED");
        order.setOrderNumber(generateOrderNumber());

        // 4. Copy CartItems to OrderItems
        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());

            ProductResponse product = getProductDetails(cartItem.getProductId());
            orderItem.setProductName(product.getName());

            orderItems.add(orderItem);

            totalAmount = totalAmount.add(
                    cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        OrderAddress address = new OrderAddress();
        address.setFullName("Areski Ilias");
        address.setAddressLine1("Chi blasa o safi");
        address.setCity("Casablanca");
        address.setPostalCode("20000");
        address.setCountry("Morocco");
        address.setPhone("+212600000000");
        order.setShippingAddress(address);

        // 5. Save the Order
        Order savedOrder = orderRepository.save(order);

        // 6. Clear the cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // --- NEW PART: Send "OrderCreated" event ---
        log.info("Sending order.created event for order: {}", savedOrder.getOrderNumber());
        OrderCreatedEvent event = createOrderEvent(savedOrder);
        rabbitTemplate.convertAndSend(
                AppConfig.EXCHANGE_NAME,
                AppConfig.ROUTING_KEY_ORDER_CREATED,
                event
        );
        // --- END NEW PART ---

        return savedOrder;
    }

    public List<Order> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Helper to build the event DTO
    private OrderCreatedEvent createOrderEvent(Order order) {
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());

        List<OrderCreatedEvent.OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> {
                    OrderCreatedEvent.OrderItemDto dto = new OrderCreatedEvent.OrderItemDto();
                    dto.setProductId(item.getProductId());
                    dto.setQuantity(item.getQuantity());
                    return dto;
                })
                .collect(Collectors.toList());

        event.setItems(itemDtos);
        return event;
    }

    // Helper to call catalogue-service
    private ProductResponse getProductDetails(UUID productId) {
        String catalogueUrl = "http://catalogue-service/products/" + productId;
        try {
            ProductResponse product = restTemplate.getForObject(catalogueUrl, ProductResponse.class);
            if (product == null) {
                throw new IllegalArgumentException("Product not found: " + productId);
            }
            return product;
        } catch (Exception e) {
            throw new IllegalArgumentException("Product not found: " + productId);
        }
    }

    // Simple order number generator
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }
}