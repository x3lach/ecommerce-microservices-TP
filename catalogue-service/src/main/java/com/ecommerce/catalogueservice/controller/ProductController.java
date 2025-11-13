package com.ecommerce.catalogueservice.controller;

import com.ecommerce.catalogueservice.model.Product;
import com.ecommerce.catalogueservice.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products") // Base path from specs
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Endpoint to list all products
     * GET /api/v1/products
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Endpoint to create a new product
     * POST /api/v1/products
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        // We'll add DTOs (Data Transfer Objects) later to make this cleaner
        // and handle validation
        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }
}
