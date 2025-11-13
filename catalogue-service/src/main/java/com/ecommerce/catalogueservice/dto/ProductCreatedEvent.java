package com.ecommerce.catalogueservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

// This is a record, which is a simple data-only class.
// It will be automatically converted to JSON for the RabbitMQ message.
public record ProductCreatedEvent(
        UUID productId,
        String sku,
        String name,
        String description,
        BigDecimal price
) {
}