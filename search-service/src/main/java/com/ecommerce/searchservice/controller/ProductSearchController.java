package com.ecommerce.searchservice.controller;

import com.ecommerce.searchservice.model.ProductDocument;
import com.ecommerce.searchservice.service.ProductSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal; // <-- Add import
import java.util.List;
import java.util.UUID; // <-- Add import

@RestController
@RequestMapping("/search")
public class ProductSearchController {

    private final ProductSearchService productSearchService;

    public ProductSearchController(ProductSearchService productSearchService) {
        this.productSearchService = productSearchService;
    }

    /**
     * Corresponds to GET /api/v1/search
     * Now with filtering!
     */
    @GetMapping
    public ResponseEntity<List<ProductDocument>> searchProducts(
            @RequestParam("q") String query,
            // --- ADD THESE NEW PARAMETERS ---
            @RequestParam(value = "category", required = false) UUID categoryId,
            @RequestParam(value = "brand", required = false) UUID brandId,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice
    ) {
        List<ProductDocument> results = productSearchService.searchProducts(
                query, categoryId, brandId, minPrice, maxPrice
        );
        // --- END UPDATE ---

        return ResponseEntity.ok(results);
    }
}