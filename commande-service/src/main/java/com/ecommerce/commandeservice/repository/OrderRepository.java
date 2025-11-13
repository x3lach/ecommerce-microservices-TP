package com.ecommerce.commandeservice.repository;


import com.ecommerce.commandeservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // We'll need this for the "My Orders" page
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
}