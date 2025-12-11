package com.ecommerce.catalogueservice.mapper;

import com.ecommerce.catalogueservice.dto.ProductResponse;
import com.ecommerce.catalogueservice.model.Product;
import com.ecommerce.catalogueservice.model.ProductImage;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductResponse toDto(Product product) {
        ProductResponse dto = new ProductResponse();
        dto.setId(product.getId());
        dto.setSellerId(product.getSellerId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setSku(product.getSku());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }
        if (product.getBrand() != null) {
            dto.setBrandName(product.getBrand().getName());
        }
        if (product.getImages() != null) {
            dto.setImageUrls(product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList()));
        }
        if (product.getShippingOptions() != null) {
            dto.setShippingOptions(product.getShippingOptions().stream()
                    .map(ps -> new ProductResponse.ShippingOptionDto(
                            ps.getShippingOption().getName(),
                            ps.getPrice()
                    ))
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
