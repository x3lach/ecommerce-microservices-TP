package org.example.userservice.service;

import org.example.userservice.dto.UserRequest;
import org.example.userservice.dto.UserResponse;
import org.example.userservice.dto.AuthRequest;
import java.util.List;
import java.util.UUID;

public interface UserService {
    String login(AuthRequest request);
    UserResponse create(UserRequest request);
    UserResponse findById(UUID id);
    List<UserResponse> findAll();
    UserResponse update(UserRequest request);
    void delete(UUID id);
}
