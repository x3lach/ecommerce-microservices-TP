package org.example.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private UUID id;
    private String addressLine1;
    private String city;
    private String postalCode;
    private String country;
    private Boolean isDefault;
    private String label;
}

