package com.ecommerce.commandeservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class CreateOrderRequest {

    private AddressDto shippingAddress;
    private String shippingMethod;
    private BigDecimal shippingPrice;

    public static class AddressDto {
        private String fullName;
        private String addressLine1;
        private String city;
        private String postalCode;
        private String country;
        private String phone;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAddressLine1() { return addressLine1; }
        public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public AddressDto getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(AddressDto shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getShippingMethod() { return shippingMethod; }
    public void setShippingMethod(String shippingMethod) { this.shippingMethod = shippingMethod; }
    public BigDecimal getShippingPrice() { return shippingPrice; }
    public void setShippingPrice(BigDecimal shippingPrice) { this.shippingPrice = shippingPrice; }
}

