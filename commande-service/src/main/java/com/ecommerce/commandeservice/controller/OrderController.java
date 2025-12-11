package com.ecommerce.commandeservice.controller;


import com.ecommerce.commandeservice.dto.CreateOrderRequest;
import com.ecommerce.commandeservice.model.Order;
import com.ecommerce.commandeservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<Order> createOrder(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(UUID.fromString(userId), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrdersForUser(@RequestHeader("X-User-Id") String userId) {
        List<Order> orders = orderService.getOrdersByUserId(UUID.fromString(userId));
        return ResponseEntity.ok(orders);
    }
}