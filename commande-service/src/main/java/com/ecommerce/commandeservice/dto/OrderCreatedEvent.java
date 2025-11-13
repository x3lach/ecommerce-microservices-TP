package com.ecommerce.commandeservice.dto;


import java.util.List;
import java.util.UUID;

// This will be the JSON message sent to RabbitMQ
public class OrderCreatedEvent {

    private UUID orderId;
    private UUID userId;
    private List<OrderItemDto> items;

    // We need a nested DTO for the items
    public static class OrderItemDto {
        private UUID productId;
        private int quantity;

        // --- Getters and Setters for OrderItemDto ---
        public UUID getProductId() { return productId; }
        public void setProductId(UUID productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    // --- Getters and Setters for OrderCreatedEvent ---
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
}