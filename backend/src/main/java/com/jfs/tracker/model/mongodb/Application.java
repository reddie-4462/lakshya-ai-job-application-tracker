package com.jfs.tracker.model.mongodb;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String company;

    private String role;

    private String jobDescription;

    private List<String> extractedSkills;

    private Double matchScore;

    private List<String> missingSkills;

    private List<String> strengths;

    private List<String> improvementSuggestions;

    private List<String> recommendedJobRoles;

    private String summary;

    private String status; // Enum values: APPLIED, INTERVIEW, OFFER, REJECTED

    private LocalDateTime createdAt;
}
