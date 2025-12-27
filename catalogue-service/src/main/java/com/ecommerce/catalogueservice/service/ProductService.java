package com.ecommerce.catalogueservice.service;

import com.ecommerce.catalogueservice.dto.ProductRequest;
import com.ecommerce.catalogueservice.dto.ProductResponse;
import com.ecommerce.catalogueservice.dto.ShippingInfo;
import com.ecommerce.catalogueservice.mapper.ProductMapper;
import com.ecommerce.catalogueservice.model.*;
import com.ecommerce.catalogueservice.repository.BrandRepository;
import com.ecommerce.catalogueservice.repository.CategoryRepository;
import com.ecommerce.catalogueservice.repository.ProductRepository;
import com.ecommerce.catalogueservice.repository.ShippingOptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import com.ecommerce.catalogueservice.config.RabbitMQConfig;
import com.ecommerce.catalogueservice.dto.ProductCreatedEvent;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ProductMapper productMapper;
    private final ImageService imageService;
    private final ShippingOptionRepository shippingOptionRepository;
    private final RestTemplate restTemplate;


    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, BrandRepository brandRepository, RabbitTemplate rabbitTemplate, ProductMapper productMapper, ImageService imageService, ShippingOptionRepository shippingOptionRepository, RestTemplate restTemplate) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.productMapper = productMapper;
        this.imageService = imageService;
        this.shippingOptionRepository = shippingOptionRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return productMapper.toDto(product);
    }

    // I am keeping the original getProductById to avoid breaking other parts of the code for now
    @Transactional(readOnly = true)
    public Product getProductEntityById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }


    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest, UUID sellerId) {
        productRepository.findBySku(productRequest.getSku()).ifPresent(p -> {
            throw new IllegalArgumentException("SKU " + p.getSku() + " already exists.");
        });

        Product product = new Product();
        product.setSellerId(sellerId);
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setStockQuantity(productRequest.getStockQuantity());
        product.setConditionState(productRequest.getCondition());
        product.setSku(productRequest.getSku());
        product.setActive(productRequest.isActive());
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());
        product.setWeight(productRequest.getWeight());
        product.setPackageLength(productRequest.getPackageLength());
        product.setPackageWidth(productRequest.getPackageWidth());
        product.setPackageHeight(productRequest.getPackageHeight());

        if (productRequest.getCategoryId() != null) {
            Category category = categoryRepository.findById(productRequest.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        if (productRequest.getBrandId() != null) {
            Brand brand = brandRepository.findById(productRequest.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found"));
            product.setBrand(brand);
        }

        if (productRequest.getShippingOptions() != null && !productRequest.getShippingOptions().isEmpty()) {
            for (ShippingInfo shippingInfo : productRequest.getShippingOptions()) {
                ShippingOption shippingOption = shippingOptionRepository.findByName(shippingInfo.getName())
                        .orElseThrow(() -> new RuntimeException("Shipping option not found: " + shippingInfo.getName()));
                ProductShipping productShipping = new ProductShipping();
                productShipping.setProduct(product);
                productShipping.setShippingOption(shippingOption);
                productShipping.setPrice(shippingInfo.getPrice());
                product.getShippingOptions().add(productShipping);
            }
        }

        Product savedProduct = productRepository.save(product);

        // Upgrade user to SELLER role if they have a valid sellerId
        if (sellerId != null) {
            upgradeUserToSeller(sellerId);
        }

        return productMapper.toDto(savedProduct);
    }

    /**
     * Calls the user-service to upgrade the user's role to SELLER
     */
    private void upgradeUserToSeller(UUID userId) {
        try {
            String url = "http://user-service/users/" + userId + "/upgrade-to-seller";
            restTemplate.patchForObject(url, null, Object.class);
            log.info("Successfully upgraded user {} to SELLER role", userId);
        } catch (Exception e) {
            // Log the error but don't fail the product creation
            log.warn("Failed to upgrade user {} to SELLER role: {}", userId, e.getMessage());
        }
    }

    @Transactional
    public ProductResponse addImagesToProduct(UUID productId, List<MultipartFile> files) {
        Product product = getProductEntityById(productId);

        if (files.size() > 8) {
            throw new IllegalArgumentException("Cannot upload more than 8 images.");
        }

        files.forEach(file -> {
            String imageUrl = imageService.store(file);
            ProductImage productImage = new ProductImage();
            productImage.setProduct(product);
            productImage.setImageUrl(imageUrl);
            product.getImages().add(productImage);
        });

        Product savedProduct = productRepository.save(product);
        return productMapper.toDto(savedProduct);
    }

    @Transactional
    public void decreaseStock(UUID productId, int quantityToDecrease) {
        log.info("Attempting to decrease stock for product: {} by quantity: {}", productId, quantityToDecrease);

        Product product = getProductEntityById(productId);

        int newStock = product.getStockQuantity() - quantityToDecrease;
        if (newStock < 0) {
            log.warn("Stock for product {} went negative. Setting to 0.", productId);
            newStock = 0;
        }

        product.setStockQuantity(newStock);
        productRepository.save(product);
        log.info("Successfully updated stock for product: {}. New stock: {}", productId, newStock);
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest productDetails) {
        try {
            Product existingProduct = getProductEntityById(id);

            if (productDetails.getSku() != null && !productDetails.getSku().equals(existingProduct.getSku())) {
                productRepository.findBySku(productDetails.getSku()).ifPresent(p -> {
                    throw new IllegalArgumentException("SKU " + p.getSku() + " already exists.");
                });
                existingProduct.setSku(productDetails.getSku());
            }

            if (productDetails.getName() != null) {
                existingProduct.setName(productDetails.getName());
            }
            if (productDetails.getDescription() != null) {
                existingProduct.setDescription(productDetails.getDescription());
            }
            if (productDetails.getPrice() != null) {
                existingProduct.setPrice(productDetails.getPrice());
            }
            if (productDetails.getStockQuantity() != null) {
                existingProduct.setStockQuantity(productDetails.getStockQuantity());
            }
            if (productDetails.getCondition() != null) {
                existingProduct.setConditionState(productDetails.getCondition());
            }
            if (productDetails.getWeight() != null) existingProduct.setWeight(productDetails.getWeight());
            if (productDetails.getPackageLength() != null) existingProduct.setPackageLength(productDetails.getPackageLength());
            if (productDetails.getPackageWidth() != null) existingProduct.setPackageWidth(productDetails.getPackageWidth());
            if (productDetails.getPackageHeight() != null) existingProduct.setPackageHeight(productDetails.getPackageHeight());

            if (productDetails.getCategoryId() != null) {
                 Category category = categoryRepository.findById(productDetails.getCategoryId())
                         .orElseThrow(() -> new RuntimeException("Category not found with ID: " + productDetails.getCategoryId()));
                 existingProduct.setCategory(category);
            }

            if (productDetails.getBrandId() != null) {
                 Brand brand = brandRepository.findById(productDetails.getBrandId())
                         .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + productDetails.getBrandId()));
                 existingProduct.setBrand(brand);
            }

            if (productDetails.getShippingOptions() != null) {
                List<ShippingInfo> incomingOptions = productDetails.getShippingOptions();
                List<ProductShipping> existingOptions = existingProduct.getShippingOptions();

                // 1. Remove options not present in the incoming list
                existingOptions.removeIf(existing -> 
                    incomingOptions.stream().noneMatch(incoming -> 
                        incoming.getName().equals(existing.getShippingOption().getName())
                    )
                );

                // 2. Add or Update options
                for (ShippingInfo incoming : incomingOptions) {
                    ProductShipping existing = existingOptions.stream()
                        .filter(e -> e.getShippingOption().getName().equals(incoming.getName()))
                        .findFirst()
                        .orElse(null);

                    if (existing != null) {
                        // Update existing
                        existing.setPrice(incoming.getPrice());
                    } else {
                        // Add new
                        ShippingOption shippingOption = shippingOptionRepository.findByName(incoming.getName())
                                .orElseThrow(() -> new RuntimeException("Shipping option not found: " + incoming.getName()));
                        
                        ProductShipping newOption = new ProductShipping();
                        newOption.setProduct(existingProduct);
                        newOption.setShippingOption(shippingOption);
                        newOption.setPrice(incoming.getPrice());
                        existingOptions.add(newOption);
                    }
                }
            }

            existingProduct.setActive(productDetails.isActive());

            Product updatedProduct = productRepository.save(existingProduct);

            log.info("Product updated successfully: {}", updatedProduct.getId());

            return productMapper.toDto(updatedProduct);
        } catch (Exception e) {
            log.error("Error updating product {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySellerId(UUID sellerId) {
        return productRepository.findBySellerId(sellerId).stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateImageOrder(UUID productId, List<String> imageUrls) {
        Product product = getProductEntityById(productId);
        
        List<ProductImage> currentImages = product.getImages();
        
        // Map to store current images by URL for easy access. 
        // Note: Image URLs in DB might be relative or absolute, we need to match carefully.
        // The frontend sends full URLs or relative? Usually we store relative.
        // Let's assume the frontend sends what it has. We might need to normalize.
        
        // Strategy: Iterate through the provided ordered list. Find matching image in currentImages. Set sort order.
        
        for (int i = 0; i < imageUrls.size(); i++) {
            String url = imageUrls.get(i);
            // Simple matching logic: Ends with the stored URL or equals
            // because frontend might prepend http://localhost:8081
            
            for (ProductImage img : currentImages) {
                if (url.endsWith(img.getImageUrl()) || img.getImageUrl().endsWith(url)) {
                    img.setSortOrder(i);
                    break;
                }
            }
        }
        
        productRepository.save(product);
        log.info("Updated image order for product {}", productId);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = getProductEntityById(id);
        productRepository.delete(product);
        log.info("Product deleted: {}", id);
    }
}
