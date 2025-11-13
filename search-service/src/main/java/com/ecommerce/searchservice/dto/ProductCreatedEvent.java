package com.ecommerce.searchservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

// This is the DTO we expect to receive from RabbitMQ
public record ProductCreatedEvent(
        UUID productId,
        String sku,
        String name,
        String description,
        BigDecimal price
) {
}