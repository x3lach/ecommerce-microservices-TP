package com.ecommerce.searchservice.repository;

import com.ecommerce.searchservice.model.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    
    // We can now REMOVE the @Query method.
    // The service will build the query itself.
    List<ProductDocument> findByName(String name);
    
    // We also remove searchMultifield(String query);
}
