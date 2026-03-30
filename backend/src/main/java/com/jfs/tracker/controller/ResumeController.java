package com.jfs.tracker.controller;

import com.jfs.tracker.dto.MatchResultDTO;
import com.jfs.tracker.model.mongodb.Resume;
import com.jfs.tracker.model.User;
import com.jfs.tracker.service.GeminiService;
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
    private final GeminiService geminiService;

    @PostMapping("/upload")
    public ResponseEntity<Resume> uploadResume(@RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        String effectiveUserId = user != null ? user.getId() : "default-user";
        return ResponseEntity.ok(resumeService.uploadAndParse(file, effectiveUserId));
    }

    @GetMapping
    public ResponseEntity<java.util.List<Resume>> getResumes(@AuthenticationPrincipal User user) {
        String effectiveUserId = user != null ? user.getId() : "default-user";
        return ResponseEntity.ok(resumeService.getResumesByUserId(effectiveUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable String id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/analyze")
    public ResponseEntity<MatchResultDTO> analyzeResume(@RequestBody Map<String, Object> request) {
        String resumeText = (String) request.get("resumeText");
        String jobDescription = (String) request.get("jobDescription");

        MatchResultDTO result = geminiService.analyzeResume(resumeText, jobDescription);
        return ResponseEntity.ok(result);
    }
}
