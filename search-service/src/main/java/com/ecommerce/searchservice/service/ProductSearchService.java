package com.ecommerce.searchservice.service;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.ecommerce.searchservice.model.ProductDocument;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductSearchService {

    private final ElasticsearchOperations elasticsearchOperations;

    public ProductSearchService(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    /**
     * Runs the advanced multi-field search with dynamic filters.
     */
    public List<ProductDocument> searchProducts(String query, UUID categoryId, UUID brandId,
                                                BigDecimal minPrice, BigDecimal maxPrice) {

        // 1. Start with a "Boolean Query"
        BoolQuery.Builder boolQuery = new BoolQuery.Builder();

        // 2. Add the "must" clause (the search query)
        // This is our multi-match search from before
        Query multiMatchQuery = new Query.Builder()
                .multiMatch(m -> m
                        .query(query)
                        .fields("name^3", "description^2", "sku")
                ).build();
        boolQuery.must(multiMatchQuery);

        // 3. Add the "filter" clauses (for exact matches)

        // Add Category filter if it exists
        if (categoryId != null) {
            boolQuery.filter(f -> f
                    .term(t -> t
                            .field("category.id")
                            .value(categoryId.toString())
                    )
            );
        }
        
        // Add Brand filter if it exists
        if (brandId != null) {
             boolQuery.filter(f -> f
                    .term(t -> t
                            .field("brand.id")
                            .value(brandId.toString())
                    )
            );
        }

        // Add Price Range filter
        if (minPrice != null && maxPrice != null) {
            boolQuery.filter(f -> f
                    .range(r -> r
                            .number(n -> n
                                    .field("price")
                                    .gte(minPrice.doubleValue())
                                    .lte(maxPrice.doubleValue())
                            )
                    )
            );
        } else if (minPrice != null) {
            boolQuery.filter(f -> f
                    .range(r -> r
                            .number(n -> n
                                    .field("price")
                                    .gte(minPrice.doubleValue())
                            )
                    )
            );
        } else if (maxPrice != null) {
            boolQuery.filter(f -> f
                    .range(r -> r
                            .number(n -> n
                                    .field("price")
                                    .lte(maxPrice.doubleValue())
                            )
                    )
            );
        }
        
        // 4. Build the final native query
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(new Query.Builder().bool(boolQuery.build()).build())
                // TODO: Add pagination and sorting here
                .build();

        // 5. Execute the search
        SearchHits<ProductDocument> hits = elasticsearchOperations.search(nativeQuery, ProductDocument.class);

        // 6. Return the results
        return hits.stream()
                .map(hit -> hit.getContent())
                .collect(Collectors.toList());
    }
}