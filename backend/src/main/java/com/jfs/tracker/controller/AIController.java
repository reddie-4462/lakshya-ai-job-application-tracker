package com.jfs.tracker.controller;

import com.jfs.tracker.dto.MatchResultDTO;
import com.jfs.tracker.model.mongodb.Application;
import com.jfs.tracker.model.mongodb.User;
import com.jfs.tracker.service.ActivityLogService;
import com.jfs.tracker.service.ApplicationService;
import com.jfs.tracker.service.OllamaService;
import com.jfs.tracker.service.ResumeParsingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final OllamaService ollamaService;
    private final ApplicationService applicationService;
    private final ResumeParsingService resumeParsingService;
    private final ActivityLogService activityLogService;

    @PostMapping("/match")
    public ResponseEntity<MatchResultDTO> matchResume(@RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String effectiveUserId = user != null ? user.getId() : body.get("userId");
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        String resumeText = body.get("resumeText");
        String jobDescription = body.get("jobDescription");
        
        MatchResultDTO result = ollamaService.analyzeResume(resumeText, jobDescription);
        activityLogService.logActivity(effectiveUserId, "AI_MATCHING", "Performed job-resume match analysis");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/optimize")
    public ResponseEntity<MatchResultDTO> optimizeResume(@RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String effectiveUserId = user != null ? user.getId() : body.get("userId");
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        String resumeText = body.get("resumeText");
        
        MatchResultDTO result = ollamaService.optimizeResume(resumeText);
        activityLogService.logActivity(effectiveUserId, "AI_OPTIMIZATION", "Performed resume optimization analysis");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/analyze")
    public ResponseEntity<MatchResultDTO> aiAnalyze(@RequestBody Map<String, Object> request,
            @AuthenticationPrincipal User user) {
        String effectiveUserId = user != null ? user.getId() : (String) request.get("userId");
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        String resumeText = (String) request.get("resumeText");
        String jobDescription = (String) request.get("jobDescription");

        MatchResultDTO aiResult = ollamaService.analyzeResume(resumeText, jobDescription);
        
        activityLogService.logActivity(effectiveUserId, "AI_ANALYSIS", "Performed AI analysis for " + (request.get("company") != null ? request.get("company") : "unspecified company"));

        // Auto-save to applications collection if company/role are provided
        String company = (String) request.get("company");
        String role = (String) request.get("role");

        if (company != null && role != null) {
            List<String> extractedSkills = resumeParsingService.extractSkills(resumeText);

            Application app = Application.builder()
                    .userId(effectiveUserId)
                    .company(company)
                    .role(role)
                    .jobDescription(jobDescription)
                    .extractedSkills(extractedSkills)
                    .matchScore(aiResult.getMatchScore())
                    .missingSkills(aiResult.getMissingSkills())
                    .strengths(aiResult.getStrengths())
                    .improvementSuggestions(aiResult.getImprovementSuggestions())
                    .recommendedJobRoles(aiResult.getRecommendedJobRoles())
                    .summary(aiResult.getSummary())
                    .status("APPLIED")
                    .createdAt(LocalDateTime.now())
                    .build();

            applicationService.saveApplication(app);
        }

        return ResponseEntity.ok(aiResult);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> aiChat(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String response = ollamaService.chat(prompt);
        return ResponseEntity.ok(Map.of("response", response));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> aiHealth() {
        return ResponseEntity.ok(ollamaService.checkHealth());
    }
}
