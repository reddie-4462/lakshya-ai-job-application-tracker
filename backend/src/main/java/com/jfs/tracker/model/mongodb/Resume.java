package com.jfs.tracker.model.mongodb;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndex(name = "user_upload_idx", def = "{'userId': 1, 'uploadDate': -1}")
public class Resume {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String rawText;

    private List<String> parsedSkills;

    private LocalDateTime uploadDate;

    private List<Double> embeddings;
}
