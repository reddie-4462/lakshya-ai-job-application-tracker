package com.jfs.tracker.controller;

import com.jfs.tracker.model.mongodb.Application;
import com.jfs.tracker.model.User;
import com.jfs.tracker.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final ApplicationService applicationService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String userId) {
        log.info("📊 Fetching summary. User: {}, Param: {}", user != null ? user.getId() : "null", userId);
        String effectiveUserId = user != null ? user.getId() : userId;
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(applicationService.getDashboardStats(effectiveUserId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Application>> getRecent(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String userId) {
        String effectiveUserId = user != null ? user.getId() : userId;
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(applicationService.getRecentApplications(effectiveUserId));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<Map<String, Object>>> getActivity(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String userId) {
        String effectiveUserId = user != null ? user.getId() : userId;
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(applicationService.getActivityData(effectiveUserId));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Dashboard API is alive");
    }
}
