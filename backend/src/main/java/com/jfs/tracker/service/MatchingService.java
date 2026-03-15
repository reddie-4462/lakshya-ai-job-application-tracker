package com.jfs.tracker.service;

import com.jfs.tracker.dto.MatchResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

    /**
     * Calculates match score based on Jaccard Similarity of skills
     */
    public MatchResultDTO calculateMatch(List<String> resumeSkills, List<String> jobSkills) {
        if (resumeSkills == null || jobSkills == null || jobSkills.isEmpty()) {
            return MatchResultDTO.builder().matchScore(0.0).build();
        }

        Set<String> resumeSet = new HashSet<>(
                resumeSkills.stream().map(String::toLowerCase).collect(Collectors.toSet()));
        Set<String> jobSet = new HashSet<>(jobSkills.stream().map(String::toLowerCase).collect(Collectors.toSet()));

        Set<String> intersection = new HashSet<>(resumeSet);
        intersection.retainAll(jobSet);

        Set<String> missing = new HashSet<>(jobSet);
        missing.removeAll(resumeSet);

        double score = (double) intersection.size() / jobSet.size() * 100;

        return MatchResultDTO.builder()
                .matchScore(score)
                .matchingSkills(new ArrayList<>(intersection))
                .missingSkills(new ArrayList<>(missing))
                .analysis(generateAnalysis(score, missing))
                .build();
    }

    private String generateAnalysis(double score, Set<String> missing) {
        if (score >= 80)
            return "Excellent match! You have most of the required skills.";
        if (score >= 50)
            return "Good match. Consider highlighting: " + String.join(", ", missing);
        return "Low match. You are missing key skills: " + String.join(", ", missing);
    }
}
