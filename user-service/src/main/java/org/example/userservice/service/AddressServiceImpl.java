package org.example.userservice.service;

import lombok.RequiredArgsConstructor;
import org.example.userservice.dto.AddressRequest;
import org.example.userservice.dto.AddressResponse;
import org.example.userservice.model.Address;
import org.example.userservice.model.User;
import org.example.userservice.repository.AddressRepository;
import org.example.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AddressResponse createAddress(UUID userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If this is the first address or marked as default, set it as default
        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        boolean shouldBeDefault = existingAddresses.isEmpty() || (request.getIsDefault() != null && request.getIsDefault());

        // If setting as default, unset other default addresses
        if (shouldBeDefault) {
            existingAddresses.forEach(addr -> {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            });

            // Update user's primary address fields
            user.setAddressLine1(request.getAddressLine1());
            user.setCity(request.getCity());
            user.setPostalCode(request.getPostalCode());
            user.setCountry(request.getCountry());
            userRepository.save(user);
        }

        Address address = Address.builder()
                .user(user)
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .isDefault(shouldBeDefault)
                .label(request.getLabel() != null ? request.getLabel() : "Home")
                .build();

        Address savedAddress = addressRepository.save(address);
        return mapToResponse(savedAddress);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to user");
        }

        address.setAddressLine1(request.getAddressLine1());
        address.setCity(request.getCity());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        if (request.getLabel() != null) {
            address.setLabel(request.getLabel());
        }

        // If marking as default
        if (request.getIsDefault() != null && request.getIsDefault() && !address.getIsDefault()) {
            // Unset other default addresses
            List<Address> addresses = addressRepository.findByUserId(userId);
            addresses.forEach(addr -> {
                if (!addr.getId().equals(addressId)) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            });
            address.setIsDefault(true);
        }

        // If this is the default address, update user's primary address fields
        if (address.getIsDefault()) {
            User user = address.getUser();
            user.setAddressLine1(request.getAddressLine1());
            user.setCity(request.getCity());
            user.setPostalCode(request.getPostalCode());
            user.setCountry(request.getCountry());
            userRepository.save(user);
        }

        Address updatedAddress = addressRepository.save(address);
        return mapToResponse(updatedAddress);
    }

    @Override
    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to user");
        }

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        // If deleted address was default, set another address as default
        if (wasDefault) {
            List<Address> remainingAddresses = addressRepository.findByUserId(userId);
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);

                // Update user's primary address fields
                User user = userRepository.findById(userId).orElseThrow();
                user.setAddressLine1(newDefault.getAddressLine1());
                user.setCity(newDefault.getCity());
                user.setPostalCode(newDefault.getPostalCode());
                user.setCountry(newDefault.getCountry());
                userRepository.save(user);
            }
        }
    }

    @Override
    public List<AddressResponse> getUserAddresses(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AddressResponse getDefaultAddress(UUID userId) {
        Address defaultAddress = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        return defaultAddress != null ? mapToResponse(defaultAddress) : null;
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to user");
        }

        // Unset other default addresses
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(addr -> {
            addr.setIsDefault(addr.getId().equals(addressId));
            addressRepository.save(addr);
        });

        // Update user's primary address fields
        User user = address.getUser();
        user.setAddressLine1(address.getAddressLine1());
        user.setCity(address.getCity());
        user.setPostalCode(address.getPostalCode());
        user.setCountry(address.getCountry());
        userRepository.save(user);

        return mapToResponse(address);
    }

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .addressLine1(address.getAddressLine1())
                .city(address.getCity())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.getIsDefault())
                .label(address.getLabel())
                .build();
    }
}

