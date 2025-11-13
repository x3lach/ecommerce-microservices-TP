package com.ecommerce.commandeservice.dto;


import java.util.UUID;

// This is the JSON object the user will send to add an item
public class AddItemRequest {
    private UUID productId;
    private int quantity;

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
// Getters and Setters...
}