package com.jfs.tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfs.tracker.dto.MatchResultDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Slf4j
public class GeminiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String apiUrlTemplate = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=%s";

    public GeminiService(@Value("${gemini.api.key}") String apiKey,
                         ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    /**
     * Core public method to call Gemini API
     * @param prompt The input prompt for AI
     * @return AI response as String
     */
    public String getAIResponse(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "AI service unavailable";
        }
        log.info("Sending request to Gemini API with prompt length: {}", prompt.length());
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Gemini request structure: { "contents": [ { "parts": [ { "text": "PROMPT" } ] } ] }
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partContainer = new HashMap<>();
            partContainer.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(partContainer));

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            String apiUrl = String.format(apiUrlTemplate, apiKey);

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);
            Map<String, Object> responseBody = responseEntity.getBody();
            
            log.info("Received response from Gemini API");

            if (responseBody == null) {
                log.warn("Gemini API returned null body");
                return "AI service unavailable";
            }

            // Extract text from candidates[0].content.parts[0].text
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                log.warn("Gemini API returned no candidates");
                return "AI service unavailable";
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null) {
                log.warn("Gemini API candidate has no content");
                return "AI service unavailable";
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                log.warn("Gemini API content has no parts");
                return "AI service unavailable";
            }

            String responseText = (String) parts.get(0).get("text");
            log.debug("Gemini Response Content: {}", responseText);
            return responseText;

        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            return "AI service unavailable";
        }
    }

    // --- COMPATIBILITY METHODS ---

    public MatchResultDTO analyzeResume(String resumeText, String jobDescription) {
        String prompt = "You are a strict AI career coach.\n\n" +
                "Analyze the job description and the following resume.\n" +
                "Return ONLY a JSON object with this structure:\n" +
                "{\n" +
                "  \"match_score\": number (0-100),\n" +
                "  \"ats_compatibility\": number (0-100),\n" +
                "  \"candidate_level\": \"JUNIOR/MID/SENIOR/EXPERT\",\n" +
                "  \"matched_skills\": [\"skill1\", \"skill2\"],\n" +
                "  \"missing_skills\": [\"skill3\", \"skill4\"],\n" +
                "  \"strengths\": [\"strength1\"],\n" +
                "  \"improvements\": [\"improvement1\"],\n" +
                "  \"to_add\": [\"Specific sections to add\"],\n" +
                "  \"to_remove\": [\"Information to remove\"],\n" +
                "  \"recommended_roles\": [\"role1\"],\n" +
                "  \"interview_probability\": \"High/Medium/Low\",\n" +
                "  \"summary\": \"Short summary\"\n" +
                "}\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Resume:\n" + resumeText;

        return parseToMatchResultDTO(getAIResponse(prompt));
    }

    public MatchResultDTO optimizeResume(String resumeText) {
        String prompt = "You are a strict AI resume optimizer.\n" +
                "Analyze the following resume and provide improvement suggestions.\n" +
                "Return ONLY a JSON object with this structure:\n" +
                "{\n" +
                "  \"match_score\": number (0-100),\n" +
                "  \"ats_compatibility\": number (0-100),\n" +
                "  \"candidate_level\": \"Level\",\n" +
                "  \"matched_skills\": [\"Existing skills\"],\n" +
                "  \"missing_skills\": [\"Skills to add\"],\n" +
                "  \"strengths\": [\"Strengths\"],\n" +
                "  \"improvements\": [\"Improvements\"],\n" +
                "  \"to_add\": [\"Points to add\"],\n" +
                "  \"to_remove\": [\"Points to remove\"],\n" +
                "  \"recommended_roles\": [\"Target roles\"],\n" +
                "  \"interview_probability\": \"High/Medium/Low\",\n" +
                "  \"summary\": \"Brief optimization summary\"\n" +
                "}\n\n" +
                "RESUME:\n" + resumeText;

        return parseToMatchResultDTO(getAIResponse(prompt));
    }

    public String chat(String prompt) {
        return getAIResponse(prompt);
    }
    
    public String askAI(String prompt) {
        return getAIResponse(prompt);
    }

    public Map<String, Object> checkHealth() {
        try {
            if (apiKey == null || apiKey.isEmpty() || apiKey.contains("${")) {
                return Map.of("status", "failed", "error", "Gemini API Key not configured");
            }

            String response = getAIResponse("ping");

            if ("AI service unavailable".equals(response)) {
                return Map.of("status", "failed", "error", "Could not reach Gemini API");
            }

            return Map.of("status", "connected", "provider", "Google Gemini");
        } catch (Exception e) {
            log.error("Gemini health check failed: {}", e.getMessage(), e);
            return Map.of("status", "failed", "error", e.getMessage());
        }
    }

    private MatchResultDTO parseToMatchResultDTO(String jsonResponse) {
        if ("AI service unavailable".equals(jsonResponse)) {
            return fallbackDTO(jsonResponse);
        }
        try {
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
                if (cleanJson.endsWith("```")) {
                    cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                }
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
                if (cleanJson.endsWith("```")) {
                    cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                }
            }
            return objectMapper.readValue(cleanJson.trim(), MatchResultDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse JSON into MatchResultDTO: {}", e.getMessage(), e);
            return fallbackDTO("Failed to parse AI response: " + e.getMessage());
        }
    }

    private MatchResultDTO fallbackDTO(String message) {
        return MatchResultDTO.builder()
                .matchScore(0.0)
                .atsScore(0.0)
                .matchingSkills(Collections.emptyList())
                .missingSkills(Collections.emptyList())
                .strengths(Collections.emptyList())
                .improvementSuggestions(Collections.emptyList())
                .recommendedJobRoles(Collections.emptyList())
                .summary(message)
                .build();
    }
}
