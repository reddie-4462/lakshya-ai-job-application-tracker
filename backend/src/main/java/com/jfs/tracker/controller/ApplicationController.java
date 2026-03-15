package com.jfs.tracker.controller;

import com.jfs.tracker.dto.MatchResultDTO;
import com.jfs.tracker.model.mongodb.Application;
import com.jfs.tracker.service.ApplicationService;
import com.jfs.tracker.service.MatchingService;
import com.jfs.tracker.service.OllamaService;
import com.jfs.tracker.model.mongodb.User;
import com.jfs.tracker.service.ResumeParsingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ResumeParsingService resumeParsingService;
    private final MatchingService matchingService;
    private final OllamaService ollamaService;

    // -------------------------------------------------------------------
    // Applications CRUD
    // -------------------------------------------------------------------

    @PostMapping
    public ResponseEntity<Application> saveApplication(@RequestBody Application application,
            @AuthenticationPrincipal User user) {
        
        String effectiveUserId = user != null ? user.getId() : application.getUserId();
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        
        application.setUserId(effectiveUserId);
        
        if (application.getCreatedAt() == null) {
            application.setCreatedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(applicationService.saveApplication(application));
    }

    @GetMapping
    public ResponseEntity<List<Application>> getApplications(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String userId) {
        String effectiveUserId = user != null ? user.getId() : userId;
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(applicationService.getApplicationsByUserId(effectiveUserId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable String id,
            @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------
    // Legacy deterministic match (kept for backward compat, /api/analyze)
    // -------------------------------------------------------------------

    @PostMapping("/analyze")
    public ResponseEntity<MatchResultDTO> analyzeMatch(@RequestBody Map<String, Object> request) {
        String resumeText = (String) request.get("resumeText");
        String jobDescription = (String) request.get("jobDescription");

        List<String> resumeSkills = resumeParsingService.extractSkills(resumeText);
        List<String> jobSkills = resumeParsingService.extractSkills(jobDescription);

        MatchResultDTO result = matchingService.calculateMatch(resumeSkills, jobSkills);
        return ResponseEntity.ok(result);
    }
}
