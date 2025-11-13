package com.ecommerce.catalogueservice.repository;

import com.ecommerce.catalogueservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    // This will let us find a product by its SKU
    // (as required by business rule 3.1.3)
    Optional<Product> findBySku(String sku);
}
