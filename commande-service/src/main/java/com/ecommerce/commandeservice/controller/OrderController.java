package com.ecommerce.commandeservice.controller;


import com.ecommerce.commandeservice.model.Order;
import com.ecommerce.commandeservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/orders") // Gateway will remove /api/v1/
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Corresponds to POST /api/v1/orders
     * Creates a new order from the user's current cart.
     */
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestHeader("X-User-Id") String userId) {
        Order order = orderService.createOrder(UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}