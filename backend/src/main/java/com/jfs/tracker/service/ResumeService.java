package com.jfs.tracker.service;

import com.jfs.tracker.model.mongodb.Resume;
import com.jfs.tracker.repository.mongodb.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeParsingService resumeParsingService;

    public Resume uploadAndParse(MultipartFile file, String userId) {
        if (file == null || userId == null) {
            throw new RuntimeException("File and User ID are required");
        }
        String extractedText = resumeParsingService.extractText(file);
        List<String> parsedSkills = resumeParsingService.extractSkills(extractedText);

        Resume resume = Resume.builder()
                .userId(userId)
                .rawText(extractedText)
                .parsedSkills(parsedSkills)
                .uploadDate(LocalDateTime.now())
                .build();

        if (resume == null) {
            throw new RuntimeException("Failed to create resume object");
        }

        Resume saved = resumeRepository.save(resume);
        return saved;
    }

    public List<Resume> getResumesByUserId(String userId) {
        if (userId != null) {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByUploadDateDesc(userId);
            return userResumes != null ? userResumes : java.util.Collections.emptyList();
        }
        List<Resume> allResumes = resumeRepository.findAllByOrderByUploadDateDesc();
        return allResumes != null ? allResumes : java.util.Collections.emptyList();
    }

    public boolean exists(String id) {
        if (id == null) return false;
        return resumeRepository.existsById(id);
    }

    public void deleteResume(String id) {
        if (id != null) {
            resumeRepository.deleteById(id);
        }
    }
}
