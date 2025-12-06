package org.example.userservice.dto;

import lombok.Data;
import org.example.userservice.model.Role;

import java.util.UUID;

@Data
public class UserRequest {
    private UUID id;
    private String fullName;
    private String email;
    private String password;
    private Role role;
    private String addressLine1;
    private String city;
    private String postalCode;
    private String country;
    private String phone;
}
