package org.example.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.example.userservice.dto.AddressRequest;
import org.example.userservice.dto.AddressResponse;
import org.example.userservice.service.AddressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users/{userId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getUserAddresses(@PathVariable UUID userId) {
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @GetMapping("/default")
    public ResponseEntity<AddressResponse> getDefaultAddress(@PathVariable UUID userId) {
        AddressResponse defaultAddress = addressService.getDefaultAddress(userId);
        return defaultAddress != null
            ? ResponseEntity.ok(defaultAddress)
            : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            @PathVariable UUID userId,
            @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createAddress(userId, request));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId,
            @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.updateAddress(userId, addressId, request));
    }

    @PutMapping("/{addressId}/set-default")
    public ResponseEntity<AddressResponse> setDefaultAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId) {
        return ResponseEntity.ok(addressService.setDefaultAddress(userId, addressId));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}
