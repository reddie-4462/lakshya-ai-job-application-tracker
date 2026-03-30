package com.jfs.tracker.service;

import com.jfs.tracker.dto.AuthResponse;
import com.jfs.tracker.dto.LoginRequest;
import com.jfs.tracker.dto.RegisterRequest;
import com.jfs.tracker.model.User;
import com.jfs.tracker.repository.mongodb.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (request == null || request.getEmail() == null) {
            throw new RuntimeException("Invalid registration request");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        if (user == null) {
            throw new RuntimeException("Failed to create user object");
        }

        User savedUser = userRepository.save(user);
        if (savedUser == null || savedUser.getId() == null) {
            throw new RuntimeException("Failed to save user");
        }
        
        activityLogService.logActivity(savedUser.getId(), "USER_REGISTRATION", "User registered: " + savedUser.getEmail());
        
        return AuthResponse.builder()
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .message("Registration successful")
                .token(jwtService.generateToken(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .message("Login successful")
                .token(jwtService.generateToken(user))
                .build();
    }
}
