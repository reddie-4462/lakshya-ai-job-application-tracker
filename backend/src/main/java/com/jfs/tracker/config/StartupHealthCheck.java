package com.jfs.tracker.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupHealthCheck {

    private final MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void checkMongoConnectionOnStartup() {
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            log.info("MongoDB connection verified successfully.");
        } catch (Exception e) {
            log.error("MongoDB connection failed: {}", e.getMessage());
        }
    }
}
