package com.ecommerce.catalogueservice.service;

import com.ecommerce.catalogueservice.model.Brand;
import com.ecommerce.catalogueservice.repository.BrandRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }
}
