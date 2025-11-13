package com.ecommerce.searchservice.repository;



import com.ecommerce.searchservice.model.ProductDocument;
import org.springframework.data.elasticsearch.annotations.Query; // <-- Add this import
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {

    // This query still works, you can keep it
    List<ProductDocument> findByName(String name);

    // --- ADD THIS NEW METHOD ---
    /**
     * This is a multi-match query. It searches the 'query' string
     * across multiple fields: name, description, and sku.
     * The fields are weighted (name is 3x more important).
     *
     */
    @Query("""
    {
        "multi_match": {
            "query": "?0",
            "fields": ["name^3", "description^2", "sku"]
        }
    }
    """)
    List<ProductDocument> searchMultifield(String query);
}
