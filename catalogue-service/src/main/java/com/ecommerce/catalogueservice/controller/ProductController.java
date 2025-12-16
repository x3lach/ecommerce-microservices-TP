package com.ecommerce.catalogueservice.controller;

import com.ecommerce.catalogueservice.dto.ProductRequest;
import com.ecommerce.catalogueservice.dto.ProductResponse;
import com.ecommerce.catalogueservice.mapper.ProductMapper;
import com.ecommerce.catalogueservice.model.Product;
import com.ecommerce.catalogueservice.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    public ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
        this.productMapper = productMapper;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> productResponses = productService.getAllProducts();
        return ResponseEntity.ok(productResponses);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ProductResponse>> getProductsBySellerId(@PathVariable UUID sellerId) {
        List<ProductResponse> products = productService.getProductsBySellerId(sellerId);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductRequest productRequest,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        UUID sellerId = null;
        if (userId != null && !userId.isEmpty()) {
            try {
                sellerId = UUID.fromString(userId);
            } catch (IllegalArgumentException e) {
                // Invalid UUID format, keep sellerId as null
            }
        }
        ProductResponse createdProduct = productService.createProduct(productRequest, sellerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }
    
    @PostMapping("/{id}/images")
    public ResponseEntity<ProductResponse> uploadImages(@PathVariable UUID id, @RequestParam("files") List<MultipartFile> files) {
        ProductResponse updatedProduct = productService.addImagesToProduct(id, files);
        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id) {
        Product product = productService.getProductEntityById(id);
        return ResponseEntity.ok(productMapper.toDto(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable UUID id, @RequestBody ProductRequest productDetails) {
        ProductResponse updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
