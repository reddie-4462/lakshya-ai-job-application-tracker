package com.jfs.tracker.service;

import com.jfs.tracker.model.mongodb.ActivityLog;
import com.jfs.tracker.repository.mongodb.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void logActivity(String userId, String action, String description) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .action(action)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        if (log != null) {
            activityLogRepository.save(log);
        }
    }
}
