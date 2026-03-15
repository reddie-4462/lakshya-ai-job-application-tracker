package com.jfs.tracker.repository.mongodb;

import com.jfs.tracker.model.mongodb.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResumeRepository extends MongoRepository<Resume, String> {
    java.util.List<Resume> findByUserIdOrderByUploadDateDesc(String userId);

    java.util.List<Resume> findAllByOrderByUploadDateDesc();
}
