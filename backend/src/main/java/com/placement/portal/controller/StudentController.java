package com.placement.portal.controller;

import com.placement.portal.document.Resume;
import com.placement.portal.document.ResumeAnalysis;
import com.placement.portal.entity.*;
import com.placement.portal.repository.ResumeAnalysisRepository;
import com.placement.portal.security.SecurityUtils;
import com.placement.portal.service.ApplicationService;
import com.placement.portal.service.AuthService;
import com.placement.portal.service.JobService;
import com.placement.portal.service.StudentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;
    private final JobService jobService;
    private final ApplicationService applicationService;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final AuthService authService;

    public StudentController(StudentService studentService,
                             JobService jobService,
                             ApplicationService applicationService,
                             ResumeAnalysisRepository resumeAnalysisRepository,
                             AuthService authService) {
        this.studentService = studentService;
        this.jobService = jobService;
        this.applicationService = applicationService;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            return ResponseEntity.ok(student);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Student profileData) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            Student updated = studentService.updateProfile(student.getId(), profileData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/uploadResume")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Uploaded file is empty");
            }

            ResumeAnalysis analysis = studentService.uploadResume(
                    student.getId(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes()
            );

            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/resume/analysis")
    public ResponseEntity<?> getLatestAnalysis() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            ResumeAnalysis analysis = resumeAnalysisRepository
                    .findTopByStudentIdOrderByAnalyzedAtDesc(student.getId())
                    .orElseThrow(() -> new RuntimeException("No resume analysis found. Please upload a resume first."));
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/viewResume/{studentId}")
    public ResponseEntity<byte[]> viewResume(@PathVariable Long studentId) {
        try {
            Resume resume = studentService.getResume(studentId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resume.getFileName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resume.getFileData());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/downloadResume/{studentId}")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long studentId) {
        try {
            Resume resume = studentService.getResume(studentId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resume.getFileData());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getJobs() {
        // Filter jobs to only return OPEN status for student dashboard
        List<Job> openJobs = jobService.getAllJobs().stream()
                .filter(job -> "OPEN".equalsIgnoreCase(job.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(openJobs);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestParam Long jobId) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            Application application = applicationService.applyForJob(student.getId(), jobId);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            List<Application> apps = applicationService.getStudentApplications(student.getId());
            return ResponseEntity.ok(apps);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> withdraw(@PathVariable Long id) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Student student = studentService.getProfileByEmail(email);
            applicationService.withdrawApplication(id, student.getId());
            return ResponseEntity.ok("Application withdrawn successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/deactivate")
    public ResponseEntity<?> deactivateAccount() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            authService.deactivateUserByEmail(email);
            return ResponseEntity.ok("Account deactivated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
