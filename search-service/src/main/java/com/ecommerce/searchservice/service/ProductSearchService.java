package com.ecommerce.searchservice.service;


import com.ecommerce.searchservice.model.ProductDocument;
import com.ecommerce.searchservice.repository.ProductSearchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductSearchService {

    private final ProductSearchRepository productSearchRepository;

    public ProductSearchService(ProductSearchRepository productSearchRepository) {
        this.productSearchRepository = productSearchRepository;
    }

    // This is the old method, we don't need it for the controller anymore
    public List<ProductDocument> searchByName(String name) {
        return productSearchRepository.findByName(name);
    }

    // --- CREATE THIS NEW METHOD ---
    /**
     * Runs the advanced multi-field search.
     */
    public List<ProductDocument> searchProducts(String query) {
        return productSearchRepository.searchMultifield(query);
    }
}