package com.jfs.tracker.controller;

import com.jfs.tracker.dto.AuthResponse;
import com.jfs.tracker.dto.LoginRequest;
import com.jfs.tracker.dto.RegisterRequest;
import com.jfs.tracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
 
    private final AuthService authService;
 
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String message = e.getMessage();
            if (message != null && message.contains("Email already exists")) {
                return ResponseEntity.status(400).body(AuthResponse.builder()
                        .message(message)
                        .build());
            }
            return ResponseEntity.status(500).body(AuthResponse.builder()
                    .message("Internal server error: " + message)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(AuthResponse.builder()
                    .message("An unexpected error occurred during registration")
                    .build());
        }
    }
 
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(AuthResponse.builder().message(e.getMessage()).build());
        }
    }
}
