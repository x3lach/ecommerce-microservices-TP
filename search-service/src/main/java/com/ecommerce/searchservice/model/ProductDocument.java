package com.ecommerce.searchservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.math.BigDecimal;
import java.util.UUID;

@Document(indexName = "products")
public class ProductDocument {

    @Id
    private String id; // This is the Product's UUID

    @Field(type = FieldType.Text)
    private String name;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private String sku;

    @Field(type = FieldType.Double)
    private BigDecimal price;

    // --- ADD THESE NEW FIELDS ---

    @Field(type = FieldType.Object) // Nested object
    private Category category;
    
    @Field(type = FieldType.Object) // Nested object
    private Brand brand;
    
    // --- END NEW FIELDS ---
    
    // --- NESTED CLASSES FOR CATEGORY AND BRAND ---
    public static class Category {
        @Field(type = FieldType.Keyword)
        private String id;
        @Field(type = FieldType.Text)
        private String name;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class Brand {
        @Field(type = FieldType.Keyword)
        private String id;
        @Field(type = FieldType.Keyword)
        private String name;
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
    
    // --- GETTERS AND SETTERS for ProductDocument ---
    // (Generate Getters/Setters for ALL fields, including new ones)
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
}