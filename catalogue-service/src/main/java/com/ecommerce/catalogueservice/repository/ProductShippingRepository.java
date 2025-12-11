package com.ecommerce.catalogueservice.repository;

import com.ecommerce.catalogueservice.model.ProductShipping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductShippingRepository extends JpaRepository<ProductShipping, UUID> {
}
