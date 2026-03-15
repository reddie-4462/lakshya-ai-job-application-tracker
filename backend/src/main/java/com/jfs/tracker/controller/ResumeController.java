package com.jfs.tracker.controller;

import com.jfs.tracker.dto.MatchResultDTO;
import com.jfs.tracker.model.mongodb.Resume;
import com.jfs.tracker.model.mongodb.User;
import com.jfs.tracker.service.OllamaService;
import com.jfs.tracker.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final OllamaService ollamaService;

    @PostMapping("/upload")
    public ResponseEntity<Resume> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String userId) {
        String effectiveUserId = user != null ? user.getId() : userId;
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(resumeService.uploadAndParse(file, effectiveUserId));
    }

    @GetMapping
    public ResponseEntity<java.util.List<Resume>> getResumes(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String userId) {
        String effectiveUserId = user != null ? user.getId() : userId;
        if (effectiveUserId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(resumeService.getResumesByUserId(effectiveUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResume(@PathVariable String id) {
        System.out.println("Attempting to delete resume with ID: " + id);
        if (!resumeService.exists(id)) {
            System.out.println("Resume not found with ID: " + id);
            return ResponseEntity.status(404).body(Map.of("message", "Resume not found with ID: " + id));
        }
        resumeService.deleteResume(id);
        System.out.println("Successfully deleted resume with ID: " + id);
        return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
    }

    @PostMapping("/analyze")
    public ResponseEntity<MatchResultDTO> analyzeResume(@RequestBody Map<String, Object> request) {
        String resumeText = (String) request.get("resumeText");
        String jobDescription = (String) request.get("jobDescription");

        MatchResultDTO result = ollamaService.analyzeResume(resumeText, jobDescription);
        return ResponseEntity.ok(result);
    }
}
