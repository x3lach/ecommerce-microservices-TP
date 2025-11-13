package com.ecommerce.catalogueservice.service;

import com.ecommerce.catalogueservice.config.RabbitMQConfig; // Import config
import com.ecommerce.catalogueservice.dto.ProductCreatedEvent; // Import DTO
import com.ecommerce.catalogueservice.model.Product;
import com.ecommerce.catalogueservice.repository.ProductRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate; // Import Rabbit
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID; // Make sure this is imported

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate; // For sending RabbitMQ messages

    // Updated constructor to inject RabbitTemplate
    public ProductService(ProductRepository productRepository, RabbitTemplate rabbitTemplate) {
        this.productRepository = productRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Gets all products.
     * Corresponds to: GET /api/v1/products
     */
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Gets all products (paginated in the future).
     * Corresponds to: GET /api/v1/products
     */
    @Transactional(readOnly = true)
    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id)); // We'll make this a proper 404 later
    }

    /**
     * Creates a new product.
     * Corresponds to: POST /api/v1/products
     */
    @Transactional
    public Product createProduct(Product product) {
        // Business Rule 3.1.3: Check if SKU is unique
        productRepository.findBySku(product.getSku()).ifPresent(p -> {
            throw new IllegalArgumentException("SKU " + p.getSku() + " already exists.");
        });

        // Set timestamps and default values
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());
        product.setActive(true);

        // TODO: We still need to properly fetch and set the Category and Brand
        // For now, we save it directly

        // Save the product *first* to get the generated ID
        Product savedProduct = productRepository.save(product);

        // --- NEW PART: Send RabbitMQ Event ---

        // Create the event DTO (Data Transfer Object)
        ProductCreatedEvent event = new ProductCreatedEvent(
                savedProduct.getId(),
                savedProduct.getSku(),
                savedProduct.getName(),
                savedProduct.getDescription(),
                savedProduct.getPrice()
        );

        // Send the event to the RabbitMQ exchange with the correct routing key
        System.out.println("Sending product.created event for SKU: " + event.sku()); // For debugging
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_PRODUCT_CREATED,
                event
        );
        // --- END NEW PART ---

        return savedProduct; // Return the saved product to the controller
    }
}
