package com.ecommerce.searchservice.listener;

import com.ecommerce.searchservice.dto.ProductCreatedEvent;
import com.ecommerce.searchservice.model.ProductDocument;
import com.ecommerce.searchservice.repository.ProductSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class ProductEventListener {

    private static final Logger log = LoggerFactory.getLogger(ProductEventListener.class);
    private final ProductSearchRepository productSearchRepository;

    public ProductEventListener(ProductSearchRepository productSearchRepository) {
        this.productSearchRepository = productSearchRepository;
    }

    // This is the queue name from your specs
    public static final String QUEUE_NAME = "search.product.created";

    @RabbitListener(queues = QUEUE_NAME)
    public void handleProductCreated(ProductCreatedEvent event) {
        log.info("Received product.created event for SKU: {}", event.sku());

        // Convert the DTO to our Elasticsearch document
        ProductDocument doc = new ProductDocument();
        doc.setId(event.productId().toString());
        doc.setSku(event.sku());
        doc.setName(event.name());
        doc.setDescription(event.description());
        doc.setPrice(event.price());

        // Save it to Elasticsearch
        productSearchRepository.save(doc);

        log.info("Successfully indexed product with ID: {}", doc.getId());
    }
}