package com.ecommerce.commandeservice.repository;


import com.ecommerce.commandeservice.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    // We'll need this to find a cart for a specific user
    Optional<Cart> findByUserId(UUID userId);
}