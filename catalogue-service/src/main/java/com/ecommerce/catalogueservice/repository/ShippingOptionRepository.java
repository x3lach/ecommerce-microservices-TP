package com.ecommerce.catalogueservice.repository;

import com.ecommerce.catalogueservice.model.ShippingOption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ShippingOptionRepository extends JpaRepository<ShippingOption, UUID> {
    Optional<ShippingOption> findByName(String name);
}
