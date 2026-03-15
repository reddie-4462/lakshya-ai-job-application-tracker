package com.jfs.tracker.service;

import com.jfs.tracker.model.mongodb.Resume;
import com.jfs.tracker.repository.mongodb.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeParsingService resumeParsingService;

    public Resume uploadAndParse(MultipartFile file, String userId) {
        String extractedText = resumeParsingService.extractText(file);
        List<String> parsedSkills = resumeParsingService.extractSkills(extractedText);

        Resume resume = Resume.builder()
                .userId(userId)
                .rawText(extractedText)
                .parsedSkills(parsedSkills)
                .uploadDate(LocalDateTime.now())
                .build();

        Resume saved = resumeRepository.save(resume);
        return Objects.requireNonNull(saved);
    }

    public List<Resume> getResumesByUserId(String userId) {
        if (userId != null) {
            return resumeRepository.findByUserIdOrderByUploadDateDesc(userId);
        }
        return resumeRepository.findAllByOrderByUploadDateDesc();
    }

    public boolean exists(String id) {
        return resumeRepository.existsById(id);
    }

    public void deleteResume(String id) {
        resumeRepository.deleteById(id);
    }
}
