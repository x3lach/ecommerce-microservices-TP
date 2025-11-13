package com.ecommerce.searchservice.repository;


import com.ecommerce.searchservice.model.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    // Spring Data Elasticsearch will auto-implement this
}
