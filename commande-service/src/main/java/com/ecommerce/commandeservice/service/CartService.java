package com.ecommerce.commandeservice.service;


import com.ecommerce.commandeservice.dto.AddItemRequest;
import com.ecommerce.commandeservice.dto.ProductResponse;
import com.ecommerce.commandeservice.model.Cart;
import com.ecommerce.commandeservice.model.CartItem;
import com.ecommerce.commandeservice.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final RestTemplate restTemplate;

    public CartService(CartRepository cartRepository, RestTemplate restTemplate) {
        this.cartRepository = cartRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional(readOnly = true)
    public Cart getCartByUserId(UUID userId) {
        // Find an existing cart or create a new one
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
    }

    private Cart createNewCart(UUID userId) {
        Cart newCart = new Cart();
        newCart.setUserId(userId);
        newCart.setItems(new HashSet<>());
        return cartRepository.save(newCart);
    }

    @Transactional
    public Cart addItemToCart(UUID userId, AddItemRequest itemRequest) {
        // 1. Get the user's cart
        Cart cart = getCartByUserId(userId);

        // 2. Call Catalogue-Service to get product info
        // Note: We use the Eureka service name "catalogue-service"
        String catalogueUrl = "http://catalogue-service/products/" + itemRequest.getProductId();
        ProductResponse product;
        try {
            product = restTemplate.getForObject(catalogueUrl, ProductResponse.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Product not found: " + itemRequest.getProductId());
        }

        if (product == null) {
            throw new IllegalArgumentException("Product not found: " + itemRequest.getProductId());
        }

        // 3. Business Rule: Check stock
        if (product.getStockQuantity() < itemRequest.getQuantity()) {
            throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
        }

        // 4. Check if item is already in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(itemRequest.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + itemRequest.getQuantity());
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductId(itemRequest.getProductId());
            newItem.setQuantity(itemRequest.getQuantity());
            newItem.setUnitPrice(product.getPrice()); // Use price from catalogue
            cart.getItems().add(newItem);
        }

        // 5. Save the updated cart
        return cartRepository.save(cart);
    }
}