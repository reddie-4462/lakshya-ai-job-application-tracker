package com.jfs.tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfs.tracker.dto.MatchResultDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
public class OllamaService {

    private final RestClient restClient;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;
    private final String model;
    private final String apiUrl;
    private final String baseUrl;

    public OllamaService(@Value("${ollama.api.url:http://localhost:11434/api/generate}") String apiUrl,
            @Value("${ollama.model:gemma3:1b}") String model,
            ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
        this.model = model;
        this.apiUrl = apiUrl;
        // Derive base URL from API URL (e.g., http://localhost:11434 from http://localhost:11434/api/generate)
        this.baseUrl = apiUrl.replace("/api/generate", "");
    }

    public String askAI(String prompt) {
        String url = "http://localhost:11434/api/generate";
        Map<String, Object> request = new HashMap<>();
        request.put("model", "gemma3:1b");
        request.put("prompt", prompt);
        request.put("stream", false);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody().get("response").toString();
        } catch (Exception e) {
            log.error("Ollama service call failed", e);
            return "AI service unavailable.";
        }
    }

    /**
     * Matches resume against job description using Ollama AI
     */
    public MatchResultDTO analyzeResume(String resumeText, String jobDescription) {
        String prompt = String.format("""
                You are an AI career analysis system.
                Analyze the following resume against the job description.
                Return ONLY a JSON object with this structure:
                {
                  "match_score": number (0-100),
                  "ats_compatibility": number (0-100),
                  "candidate_level": "JUNIOR/MID/SENIOR/EXPERT based on content",
                  "matched_skills": ["skill1", "skill2"],
                  "missing_skills": ["skill3", "skill4"],
                  "strengths": ["strength1"],
                  "improvements": ["improvement1"],
                  "to_add": ["Specific sections or information to add to the resume"],
                  "to_remove": ["Irrelevant or outdated information to remove from the resume"],
                  "recommended_roles": ["role1"],
                  "interview_probability": "High/Medium/Low",
                  "summary": "Short summary"
                }
                
                RESUME:
                %s
                
                JOB DESCRIPTION:
                %s
                """, resumeText, jobDescription);

        return callOllamaForJson(prompt);
    }

    /**
     * Optimizes resume content using Ollama AI
     */
    public MatchResultDTO optimizeResume(String resumeText) {
        String prompt = String.format("""
                You are an AI resume optimizer.
                Analyze the following resume and provide improvement suggestions.
                Return ONLY a JSON object with this structure:
                {
                  "match_score": number (Overall Resume Score 0-100),
                  "ats_compatibility": number (ATS Optimization Score 0-100),
                  "candidate_level": "Determine seniority level (e.g., Junior, Mid, Senior, Expert)",
                  "matched_skills": ["Existing key skills"],
                  "missing_skills": ["Skills to add for better impact"],
                  "strengths": ["Current resume strengths"],
                  "improvements": ["Specific content improvements"],
                  "to_add": ["Specific points or sections to add"],
                  "to_remove": ["Redundant or weak points to remove"],
                  "recommended_roles": ["Target roles based on content"],
                  "interview_probability": "High/Medium/Low",
                  "summary": "Brief optimization summary"
                }
                
                RESUME:
                %s
                """, resumeText);

        return callOllamaForJson(prompt);
    }

    private MatchResultDTO callOllamaForJson(String prompt) {
        try {
            Map<String, Object> request = Map.of(
                    "model", model,
                    "prompt", prompt,
                    "stream", false,
                    "format", "json");

            String response = restClient.post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(String.class);

            if (response == null) return createFallbackDto("AI service returned empty response.");

            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            String responseText = (String) responseMap.get("response");
            
            // Clean JSON from responseText if needed
            responseText = cleanJson(responseText);

            return objectMapper.readValue(responseText, MatchResultDTO.class);
        } catch (Exception e) {
            log.error("Ollama JSON call failed", e);
            return createFallbackDto("AI analysis failed: " + e.getMessage());
        }
    }

    private String cleanJson(String text) {
        if (text == null) return "{}";
        text = text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        else if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
        return text.trim();
    }

    private MatchResultDTO createFallbackDto(String errorMessage) {
        return MatchResultDTO.builder()
                .matchScore(0.0)
                .atsScore(0.0)
                .matchingSkills(java.util.Collections.emptyList())
                .missingSkills(java.util.Collections.emptyList())
                .strengths(java.util.Collections.emptyList())
                .improvementSuggestions(java.util.Collections.emptyList())
                .recommendedJobRoles(java.util.Collections.emptyList())
                .summary(errorMessage)
                .build();
    }

    /**
     * General chat method for the AI assistant
     */
    public String chat(String prompt) {
        try {
            log.info("Sending chat request to Ollama API: {} using model {}...", apiUrl, model);
            Map<String, Object> request = Map.of(
                    "model", model,
                    "prompt", prompt,
                    "stream", false);

            String response = restClient.post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), (req, res) -> {
                        throw new RuntimeException("Ollama API error: " + res.getStatusCode());
                    })
                    .body(String.class);

            if (response == null) {
                log.error("Empty response from Ollama during chat");
                return "I'm sorry, I couldn't generate a response from the AI service.";
            }

            log.info("Ollama chat response received successfully");
            log.debug("Ollama Raw Chat Response: {}", response);

            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            return (String) responseMap.get("response");

        } catch (Exception e) {
            log.error("CRITICAL: AI Chat failed. Is Ollama running at {}?", apiUrl, e);
            return "Error: Could not connect to AI service. Please ensure Ollama is running locally with the " + model + " model.";
        }
    }

    /**
     * General health check for the AI service using /api/tags
     */
    public Map<String, Object> checkHealth() {
        String healthUrl = baseUrl + "/api/tags";
        try {
            log.info("Checking Ollama health at: {}", healthUrl);
            
            ResponseEntity<String> responseEntity = restClient.get()
                    .uri(healthUrl)
                    .retrieve()
                    .toEntity(String.class);

            log.info("Ollama health check status: {}", responseEntity.getStatusCode());
            log.debug("Ollama health check response: {}", responseEntity.getBody());
            
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                return Map.of("status", "connected", "model", model);
            }
            return Map.of("status", "failed", "error", "HTTP " + responseEntity.getStatusCode());
                    
        } catch (Exception e) {
            log.error("Ollama health check failed at {}: {}", healthUrl, e.getMessage());
            return Map.of("status", "failed", "error", e.getMessage());
        }
    }
}
