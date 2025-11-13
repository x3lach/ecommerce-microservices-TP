package com.ecommerce.searchservice.controller;


import com.ecommerce.searchservice.model.ProductDocument;
import com.ecommerce.searchservice.service.ProductSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search") // The gateway will remove /api/v1/
public class ProductSearchController {

    private final ProductSearchService productSearchService;

    public ProductSearchController(ProductSearchService productSearchService) {
        this.productSearchService = productSearchService;
    }

    /**
     * Corresponds to GET /api/v1/search
     * @param q The search query string
     * Example: /api/v1/search?q= nom, sku, description
     */
    @GetMapping
    public ResponseEntity<List<ProductDocument>> searchProducts(@RequestParam("q") String q) {

        // --- THIS LINE IS UPDATED ---
        // We now call the new, more powerful service method
        List<ProductDocument> results = productSearchService.searchProducts(q);
        // --- END UPDATE ---

        return ResponseEntity.ok(results);
    }
}