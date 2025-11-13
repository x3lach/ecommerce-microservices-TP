package com.ecommerce.commandeservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

// This is the data we expect to get back from catalogue-service
// It's a subset of the Catalogue's Product.java
public class ProductResponse {
    private UUID id;
    private String name;
    private BigDecimal price;
    private int stockQuantity;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
// Getters and Setters...
}