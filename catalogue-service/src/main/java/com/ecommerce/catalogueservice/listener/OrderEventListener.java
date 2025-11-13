package com.ecommerce.catalogueservice.listener;


import com.ecommerce.catalogueservice.config.RabbitMQConfig;
import com.ecommerce.catalogueservice.dto.OrderCreatedEvent;
import com.ecommerce.catalogueservice.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);
    private final ProductService productService;

    public OrderEventListener(ProductService productService) {
        this.productService = productService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME_ORDER_CREATED)
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received order.created event for order: {}", event.getOrderId());

        try {
            // Update stock for each item in the order
            for (OrderCreatedEvent.OrderItemDto item : event.getItems()) {
                productService.decreaseStock(item.getProductId(), item.getQuantity());
            }
            log.info("Stock updated for all items in order: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to update stock for order: {}", event.getOrderId(), e);
            // In a real app, we would send this to a "dead letter queue"
            // to be re-processed later.
        }
    }
}