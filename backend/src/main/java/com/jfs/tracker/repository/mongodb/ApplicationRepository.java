package com.jfs.tracker.repository.mongodb;

import com.jfs.tracker.model.mongodb.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndStatus(String userId, String status);

    List<Application> findTop5ByUserIdOrderByCreatedAtDesc(String userId);

    List<Application> findTop5ByOrderByCreatedAtDesc();
}
