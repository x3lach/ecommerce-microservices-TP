package org.example.userservice.service;

import org.example.userservice.dto.AddressRequest;
import org.example.userservice.dto.AddressResponse;

import java.util.List;
import java.util.UUID;

public interface AddressService {
    AddressResponse createAddress(UUID userId, AddressRequest request);
    AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request);
    void deleteAddress(UUID userId, UUID addressId);
    List<AddressResponse> getUserAddresses(UUID userId);
    AddressResponse getDefaultAddress(UUID userId);
    AddressResponse setDefaultAddress(UUID userId, UUID addressId);
}

