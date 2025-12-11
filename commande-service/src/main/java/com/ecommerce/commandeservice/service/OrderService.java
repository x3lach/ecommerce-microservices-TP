package com.ecommerce.commandeservice.service;


import com.ecommerce.commandeservice.config.AppConfig;
import com.ecommerce.commandeservice.dto.CreateOrderRequest;
import com.ecommerce.commandeservice.dto.OrderCreatedEvent;
import com.ecommerce.commandeservice.dto.ProductResponse;
import com.ecommerce.commandeservice.model.*;
import com.ecommerce.commandeservice.repository.CartRepository;
import com.ecommerce.commandeservice.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final RestTemplate restTemplate;
    private final RabbitTemplate rabbitTemplate;

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public OrderService(OrderRepository orderRepository, CartService cartService,
                        CartRepository cartRepository, RestTemplate restTemplate,
                        RabbitTemplate rabbitTemplate) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.cartRepository = cartRepository;
        this.restTemplate = restTemplate;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public Order createOrder(UUID userId, CreateOrderRequest request) {
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
        order.setStatus("PENDING"); // Changed from CONFIRMED to PENDING
        order.setOrderNumber(generateOrderNumber());

        // 4. Set shipping method and price from request
        if (request.getShippingMethod() != null) {
            order.setShippingMethod(request.getShippingMethod());
            order.setShippingPrice(request.getShippingPrice() != null ? request.getShippingPrice() : BigDecimal.ZERO);
        }

        // 5. Copy CartItems to OrderItems
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

        // Add shipping price to total
        if (order.getShippingPrice() != null) {
            totalAmount = totalAmount.add(order.getShippingPrice());
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        // 6. Set shipping address from request
        if (request.getShippingAddress() != null) {
            OrderAddress address = new OrderAddress();
            address.setFullName(request.getShippingAddress().getFullName());
            address.setAddressLine1(request.getShippingAddress().getAddressLine1());
            address.setCity(request.getShippingAddress().getCity());
            address.setPostalCode(request.getShippingAddress().getPostalCode());
            address.setCountry(request.getShippingAddress().getCountry());
            address.setPhone(request.getShippingAddress().getPhone());
            order.setShippingAddress(address);
        }

        // 7. Save the Order
        Order savedOrder = orderRepository.save(order);

        // 8. Clear the cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // 9. Send "OrderCreated" event
        log.info("Sending order.created event for order: {}", savedOrder.getOrderNumber());
        OrderCreatedEvent event = createOrderEvent(savedOrder);
        rabbitTemplate.convertAndSend(
                AppConfig.EXCHANGE_NAME,
                AppConfig.ROUTING_KEY_ORDER_CREATED,
                event
        );

        return savedOrder;
    }

    public List<Order> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

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

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }
}