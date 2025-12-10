package org.example.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.example.userservice.dto.UserRequest;
import org.example.userservice.dto.UserResponse;
import org.example.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@PostMapping
	public ResponseEntity<UserResponse> create(@RequestBody UserRequest request) {
		UserResponse created = userService.create(request);
		return ResponseEntity.status(201).body(created);
	}

	@PostMapping("/{id}/profile-image")
	public ResponseEntity<UserResponse> uploadProfileImage(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
		return ResponseEntity.ok(userService.updateProfileImage(id, file));
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
		return ResponseEntity.ok(userService.findById(id));
	}

	@GetMapping
	public ResponseEntity<List<UserResponse>> getAll() {
		return ResponseEntity.ok(userService.findAll());
	}

	@PutMapping("/{id}")
	public ResponseEntity<UserResponse> update(@PathVariable UUID id, @RequestBody UserRequest request) {
		request.setId(id);
		return ResponseEntity.ok(userService.update(request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		userService.delete(id);
		return ResponseEntity.noContent().build();
	}

}
