package com.placement.portal.controller;

import com.placement.portal.entity.*;
import com.placement.portal.security.SecurityUtils;
import com.placement.portal.service.ApplicationService;
import com.placement.portal.service.AuthService;
import com.placement.portal.service.InterviewService;
import com.placement.portal.service.JobService;
import com.placement.portal.service.RecruiterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recruiter")
public class RecruiterController {

    private final RecruiterService recruiterService;
    private final JobService jobService;
    private final ApplicationService applicationService;
    private final InterviewService interviewService;
    private final AuthService authService;

    public RecruiterController(RecruiterService recruiterService,
                               JobService jobService,
                               ApplicationService applicationService,
                               InterviewService interviewService,
                               AuthService authService) {
        this.recruiterService = recruiterService;
        this.jobService = jobService;
        this.applicationService = applicationService;
        this.interviewService = interviewService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            return ResponseEntity.ok(recruiter);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Recruiter profileData) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            Recruiter updated = recruiterService.updateProfile(recruiter.getId(), profileData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            Job created = jobService.createJob(job, recruiter.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            Job updated = jobService.updateJob(id, jobDetails, recruiter.getId(), false);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            jobService.deleteJob(id, recruiter.getId(), false);
            return ResponseEntity.ok("Job deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getMyJobs() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            List<Job> jobs = jobService.getJobsByRecruiter(recruiter.getId());
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/applicants")
    public ResponseEntity<?> getApplicants() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            List<Application> applicants = applicationService.getRecruiterApplicants(recruiter.getId());
            return ResponseEntity.ok(applicants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id, 
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String rejectionReason) {
        try {
            Application updated = applicationService.updateStatusWithReason(id, status, rejectionReason);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/interviews/schedule")
    public ResponseEntity<?> scheduleInterview(@RequestParam Long applicationId,
                                               @RequestParam String interviewDate,
                                               @RequestParam String interviewType,
                                               @RequestParam String locationOrLink,
                                               @RequestParam String description) {
        try {
            LocalDateTime dateTime = LocalDateTime.parse(interviewDate);
            Interview interview = interviewService.scheduleInterview(applicationId, dateTime, interviewType, locationOrLink, description);
            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            Recruiter recruiter = recruiterService.getProfileByEmail(email);
            Map<String, Object> stats = recruiterService.getAnalytics(recruiter.getId());
            return ResponseEntity.ok(stats);
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
