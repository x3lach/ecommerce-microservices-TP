package com.ecommerce.commandeservice.controller;

import com.ecommerce.commandeservice.dto.AddItemRequest;
import com.ecommerce.commandeservice.model.Cart;
import com.ecommerce.commandeservice.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cart") // Gateway will remove /api/v1/
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Corresponds to GET /api/v1/cart
     */
    @GetMapping
    public ResponseEntity<Cart> getMyCart(@RequestHeader("X-User-Id") String userId) {
        Cart cart = cartService.getCartByUserId(UUID.fromString(userId));
        return ResponseEntity.ok(cart);
    }

    /**
     * Corresponds to POST /api/v1/cart/items
     */
    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToMyCart(@RequestHeader("X-User-Id") String userId, @RequestBody AddItemRequest itemRequest) {
        Cart cart = cartService.addItemToCart(UUID.fromString(userId), itemRequest);
        return ResponseEntity.ok(cart);
    }
}