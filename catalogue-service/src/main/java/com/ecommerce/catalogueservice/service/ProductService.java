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


    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, BrandRepository brandRepository, RabbitTemplate rabbitTemplate, ProductMapper productMapper, ImageService imageService, ShippingOptionRepository shippingOptionRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.productMapper = productMapper;
        this.imageService = imageService;
        this.shippingOptionRepository = shippingOptionRepository;
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

        return productMapper.toDto(savedProduct);
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
    public Product updateProduct(UUID id, Product productDetails) {
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
        if (productDetails.getStockQuantity() != existingProduct.getStockQuantity()) {
            existingProduct.setStockQuantity(productDetails.getStockQuantity());
        }

        Product updatedProduct = productRepository.save(existingProduct);

        log.info("Product updated: {}", updatedProduct.getId());

        return updatedProduct;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySellerId(UUID sellerId) {
        return productRepository.findBySellerId(sellerId).stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = getProductEntityById(id);
        productRepository.delete(product);
        log.info("Product deleted: {}", id);
    }
}
