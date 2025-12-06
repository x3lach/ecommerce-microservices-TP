package com.ecommerce.searchservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductCreatedEvent(
        UUID productId,
        String sku,
        String name,
        String description,
        BigDecimal price
) {
}
