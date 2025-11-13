package com.ecommerce.commandeservice.controller;


import com.ecommerce.commandeservice.model.Order;
import com.ecommerce.commandeservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/orders") // Gateway will remove /api/v1/
public class OrderController {

    private final OrderService orderService;

    // A hardcoded User ID for testing.
    private static final UUID TEST_USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Corresponds to POST /api/v1/orders
     * Creates a new order from the user's current cart.
     */
    @PostMapping
    public ResponseEntity<Order> createOrder() {
        Order order = orderService.createOrder(TEST_USER_ID);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}