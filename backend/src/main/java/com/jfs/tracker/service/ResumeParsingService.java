package com.jfs.tracker.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ResumeParsingService {

    /**
     * Extracts text from PDF/DOCX using Apache Tika
     */
    public String extractText(MultipartFile file) {
        try (InputStream stream = file.getInputStream()) {
            Parser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler();
            Metadata metadata = new Metadata();
            ParseContext context = new ParseContext();

            parser.parse(stream, handler, metadata, context);
            return handler.toString();
        } catch (Exception e) {
            log.error("Failed to parse file", e);
            throw new RuntimeException("Resume parsing failed", e);
        }
    }

    /**
     * Basic skill extraction (Regex-based for demo, use NLP for production)
     */
    public List<String> extractSkills(String text) {
        List<String> knownSkills = Arrays.asList("Java", "Spring Boot", "React", "Python", "SQL", "MongoDB", "AWS",
                "Docker", "Kubernetes", "Tailwind");
        return knownSkills.stream()
                .filter(skill -> text.toLowerCase().contains(skill.toLowerCase()))
                .collect(Collectors.toList());
    }
}
