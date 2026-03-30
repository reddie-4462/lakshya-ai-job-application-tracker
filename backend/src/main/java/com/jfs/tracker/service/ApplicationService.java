package com.jfs.tracker.service;

import com.jfs.tracker.model.mongodb.Application;
import com.jfs.tracker.repository.mongodb.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ActivityLogService activityLogService;

    public Application saveApplication(Application application) {
        if (application.getCreatedAt() == null) {
            application.setCreatedAt(LocalDateTime.now());
        }
        Application saved = applicationRepository.save(application);
        if (saved != null && saved.getUserId() != null) {
            activityLogService.logActivity(saved.getUserId(), "APPLICATION_CREATED", 
                "Created application for " + saved.getRole() + " at " + saved.getCompany());
        }
        return saved;
    }

    public List<Application> getApplicationsByUserId(String userId) {
        List<Application> apps = applicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return apps != null ? apps : java.util.Collections.emptyList();
    }

    public List<Application> getAllApplications() {
        List<Application> apps = applicationRepository.findAll();
        return apps != null ? apps : java.util.Collections.emptyList();
    }

    public Application updateStatus(String id, String status) {
        if (id == null) {
            throw new RuntimeException("Application ID cannot be null");
        }
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        String oldStatus = application.getStatus();
        application.setStatus(status);
        Application saved = applicationRepository.save(application);
        if (saved != null && saved.getUserId() != null) {
            activityLogService.logActivity(saved.getUserId(), "STATUS_UPDATED", 
                "Status updated from " + oldStatus + " to " + status + " for " + saved.getCompany());
        }
        return saved;
    }

    public Map<String, Object> getDashboardStats(String userId) {
        if (userId == null) {
            return Map.of(
                "totalApplications", 0,
                "interviews", 0,
                "offers", 0,
                "rejections", 0,
                "avgMatchScore", 0
            );
        }
        List<Application> apps = getApplicationsByUserId(userId);
        
        long total = apps.size();
        long interviews = apps.stream().filter(a -> "INTERVIEW".equalsIgnoreCase(a.getStatus())).count();
        long offers = apps.stream().filter(a -> "OFFER".equalsIgnoreCase(a.getStatus())).count();
        long rejections = apps.stream().filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus())).count();
        double avgMatch = apps.stream()
                .filter(a -> a.getMatchScore() != null)
                .mapToDouble(Application::getMatchScore)
                .average()
                .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", total);
        stats.put("interviews", interviews);
        stats.put("offers", offers);
        stats.put("rejections", rejections);
        stats.put("avgMatchScore", Math.round(avgMatch));
        
        return stats;
    }

    public List<Application> getRecentApplications(String userId) {
        if (userId != null) {
            return applicationRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        }
        return List.of();
    }

    public java.util.List<Map<String, Object>> getActivityData(String userId) {
        if (userId == null) return java.util.Collections.emptyList();

        List<Application> apps = getApplicationsByUserId(userId);
        java.time.LocalDate today = java.time.LocalDate.now();
        java.util.Map<String, Integer> dailyStats = new java.util.TreeMap<>();

        // Initialize last 7 days
        for (int i = 6; i >= 0; i--) {
            dailyStats.put(today.minusDays(i).toString(), 0);
        }

        for (Application app : apps) {
            if (app.getCreatedAt() != null) {
                String dateKey = app.getCreatedAt().toLocalDate().toString();
                if (dailyStats.containsKey(dateKey)) {
                    dailyStats.put(dateKey, dailyStats.get(dateKey) + 1);
                }
            }
        }

        java.util.List<Map<String, Object>> activity = new java.util.ArrayList<>();
        dailyStats.forEach((date, count) -> {
            Map<String, Object> point = new HashMap<>();
            point.put("date", date);
            point.put("count", count);
            activity.add(point);
        });

        return activity;
    }

    public void deleteApplication(String id) {
        if (id != null) {
            applicationRepository.deleteById(id);
        }
    }
}
