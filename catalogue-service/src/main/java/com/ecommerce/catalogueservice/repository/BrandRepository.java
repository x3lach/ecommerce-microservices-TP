package com.ecommerce.catalogueservice.repository;

import com.ecommerce.catalogueservice.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    // JpaRepository gives us everything we need for now
}