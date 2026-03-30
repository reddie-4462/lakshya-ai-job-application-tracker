package com.jfs.tracker.controller.health;

import com.jfs.tracker.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class HealthCheckController {

    private final MongoTemplate mongoTemplate;
    private final GeminiService geminiService;

    @GetMapping("/mongo")
    public ResponseEntity<Map<String, String>> checkMongoConnection() {
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            return ResponseEntity.ok(Map.of("database", "MongoDB", "status", "connected"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("database", "MongoDB", "status", "failed"));
        }
    }

    @GetMapping("/ai")
    public ResponseEntity<Map<String, String>> checkAiConnection() {
        Map<String, Object> health = geminiService.checkHealth();
        if ("connected".equals(health.get("status"))) {
            return ResponseEntity.ok(Map.of("ai_service", "Gemini", "status", "connected"));
        } else {
            return ResponseEntity.status(503).body(Map.of("ai_service", "Gemini", "status", "failed"));
        }
    }
}
