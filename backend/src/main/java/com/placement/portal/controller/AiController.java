package com.placement.portal.controller;

import com.placement.portal.document.AiRecommendation;
import com.placement.portal.document.Resume;
import com.placement.portal.entity.*;
import com.placement.portal.repository.AiRecommendationRepository;
import com.placement.portal.security.SecurityUtils;
import com.placement.portal.service.AiService;
import com.placement.portal.service.JobService;
import com.placement.portal.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;
    private final StudentService studentService;
    private final JobService jobService;
    private final AiRecommendationRepository aiRecommendationRepository;

    public AiController(AiService aiService,
                        StudentService studentService,
                        JobService jobService,
                        AiRecommendationRepository aiRecommendationRepository) {
        this.aiService = aiService;
        this.studentService = studentService;
        this.jobService = jobService;
        this.aiRecommendationRepository = aiRecommendationRepository;
    }

    @PostMapping("/checkEligibility")
    public ResponseEntity<?> checkEligibility(@RequestParam Long jobId) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            Job job = jobService.getJobById(jobId);
            Map<String, Object> result = aiService.checkEligibility(student, job);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/matchResume")
    public ResponseEntity<?> matchResume(@RequestParam Long jobId) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            Resume resume = studentService.getResume(student.getId());
            Job job = jobService.getJobById(jobId);
            Map<String, Object> result = aiService.matchResume(resume.getExtractedText(), job.getDescription());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/recommendCareer")
    public ResponseEntity<?> recommendCareer() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            AiRecommendation recommendation = aiService.generateCareerRecommendations(student);
            return ResponseEntity.ok(recommendation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            AiRecommendation recommendation = aiRecommendationRepository
                    .findTopByStudentIdOrderByRecommendedAtDesc(student.getId())
                    .orElseThrow(() -> new RuntimeException("No recommendations found. Let the AI analyze your profile first."));
            return ResponseEntity.ok(recommendation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
