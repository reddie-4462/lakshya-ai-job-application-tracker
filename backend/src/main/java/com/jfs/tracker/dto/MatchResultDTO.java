package com.jfs.tracker.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MatchResultDTO {
    @JsonProperty("match_score")
    private Double matchScore; 

    @JsonProperty("ats_compatibility")
    private Double atsScore;

    @JsonProperty("matched_skills")
    @Builder.Default
    private List<String> matchingSkills = new java.util.ArrayList<>();

    @JsonProperty("missing_skills")
    @Builder.Default
    private List<String> missingSkills = new java.util.ArrayList<>();

    @JsonProperty("strengths")
    @Builder.Default
    private List<String> strengths = new java.util.ArrayList<>();

    @JsonProperty("improvements")
    @Builder.Default
    private List<String> improvementSuggestions = new java.util.ArrayList<>();

    @JsonProperty("recommended_roles")
    @Builder.Default
    private List<String> recommendedJobRoles = new java.util.ArrayList<>();

    @JsonProperty("summary")
    private String summary;

    // Legacy/Old fields support for backward compatibility if needed
    private String skillGapAnalysis;
    @JsonProperty("interview_probability")
    private String interviewProbability;
    private String analysis;

    @Builder.Default
    private List<String> strongestSkillDomains = new java.util.ArrayList<>();

    @Builder.Default
    private List<String> missingTechnologies = new java.util.ArrayList<>();

    @Builder.Default
    private List<String> careerGrowthSuggestions = new java.util.ArrayList<>();

    @JsonProperty("to_add")
    @Builder.Default
    private List<String> itemsToAdd = new java.util.ArrayList<>();

    @JsonProperty("to_remove")
    @Builder.Default
    private List<String> itemsToRemove = new java.util.ArrayList<>();

    @JsonProperty("candidate_level")
    private String candidateLevel;
}
