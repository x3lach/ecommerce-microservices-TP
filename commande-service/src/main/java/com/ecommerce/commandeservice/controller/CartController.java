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

    // A hardcoded User ID for testing.
    // In a real app, this would come from the JWT token.
    private static final UUID TEST_USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Corresponds to GET /api/v1/cart
     */
    @GetMapping
    public ResponseEntity<Cart> getMyCart() {
        Cart cart = cartService.getCartByUserId(TEST_USER_ID);
        return ResponseEntity.ok(cart);
    }

    /**
     * Corresponds to POST /api/v1/cart/items
     */
    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToMyCart(@RequestBody AddItemRequest itemRequest) {
        Cart cart = cartService.addItemToCart(TEST_USER_ID, itemRequest);
        return ResponseEntity.ok(cart);
    }
}