package org.example.userservice.service;

import org.example.userservice.dto.AuthRequest;
import org.example.userservice.dto.UserRequest;
import org.example.userservice.dto.UserResponse;
import org.example.userservice.model.User;
import org.example.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.example.userservice.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(); // simple init for now

    @Override
    public String login(AuthRequest request) {
        // 1. Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check password
        // If passwords were stored encoded, use passwordEncoder.matches().
        // If stored as plain text (legacy), fall back to equals.
        boolean matches = false;
        try {
            matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        } catch (Exception ignored) {
            // ignore and fallback
        }
        if (!matches && !request.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // 3. Generate Token
        return jwtUtil.generateToken(user);
    }

    @Override
    public UserResponse create(UserRequest request) {
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(request.getPassword() != null ? passwordEncoder.encode(request.getPassword()) : null)
                .role(request.getRole())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .phone(request.getPhone())
                .build();

        User saved = userRepository.save(user);

        return toUserResponse(saved);
    }

    @Override
    public UserResponse findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toUserResponse(user);
    }

    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse update(UserRequest request) {
        if (request.getId() == null) {
            throw new IllegalArgumentException("User id is required for update");
        }

        User existing = userRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setFullName(request.getFullName());
        existing.setEmail(request.getEmail());
        if (request.getPassword() != null) {
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        existing.setAddressLine1(request.getAddressLine1());
        existing.setCity(request.getCity());
        existing.setPostalCode(request.getPostalCode());
        existing.setCountry(request.getCountry());
        existing.setPhone(request.getPhone());


        User saved = userRepository.save(existing);

        return toUserResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        userRepository.deleteById(id);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .addressLine1(user.getAddressLine1())
                .city(user.getCity())
                .postalCode(user.getPostalCode())
                .country(user.getCountry())
                .phone(user.getPhone())
                .build();
    }
}
