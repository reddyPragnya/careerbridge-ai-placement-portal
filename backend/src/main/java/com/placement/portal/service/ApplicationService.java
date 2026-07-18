package com.placement.portal.service;

import com.placement.portal.document.Resume;
import com.placement.portal.entity.*;
import com.placement.portal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;
    private final NotificationRepository notificationRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              JobRepository jobRepository,
                              ResumeRepository resumeRepository,
                              AiService aiService,
                              NotificationRepository notificationRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.aiService = aiService;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Application applyForJob(Long studentId, Long jobId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));

        if (applicationRepository.existsByStudentIdAndJobId(studentId, jobId)) {
            throw new RuntimeException("You have already applied for this job!");
        }

        // Fetch resume from MongoDB
        Resume resume = resumeRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Please upload a resume before applying."));

        Application application = new Application(student, job);
        application.setResumeUrl("/api/student/viewResume/" + studentId); // Virtual URL

        // Integrate AI eligibility checker
        Map<String, Object> eligibilityResult = aiService.checkEligibility(student, job);
        application.setEligibilityStatus((Boolean) eligibilityResult.getOrDefault("eligible", false));
        application.setEligibilityReason((String) eligibilityResult.getOrDefault("reason", "Unable to evaluate criteria."));

        // Integrate AI resume matching
        Map<String, Object> matchResult = aiService.matchResume(resume.getExtractedText(), job.getDescription());
        Object percentage = matchResult.get("matchPercentage");
        if (percentage instanceof Number) {
            application.setMatchPercentage(((Number) percentage).doubleValue());
        } else if (percentage instanceof String) {
            application.setMatchPercentage(Double.parseDouble((String) percentage));
        } else {
            application.setMatchPercentage(50.0);
        }

        application.setStatus(ApplicationStatus.APPLIED);
        Application savedApp = applicationRepository.save(application);

        // Send notification to Recruiter
        Notification notification = new Notification();
        notification.setUser(job.getRecruiter().getUser());
        notification.setMessage("New application received for '" + job.getJobTitle() + "' from student " + student.getFullName() + ". AI Match Score: " + application.getMatchPercentage() + "%");
        notificationRepository.save(notification);

        return savedApp;
    }

    @Transactional
    public void withdrawApplication(Long applicationId, Long studentId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Unauthorized to withdraw this application.");
        }

        applicationRepository.delete(application);
    }

    @Transactional
    public Application updateStatus(Long applicationId, ApplicationStatus status) {
        return updateStatusWithReason(applicationId, status, null);
    }

    @Transactional
    public Application updateStatusWithReason(Long applicationId, ApplicationStatus status, String rejectionReason) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        if (status == ApplicationStatus.REJECTED) {
            if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
                application.setRejectionReason(rejectionReason);
            }
        } else {
            application.setRejectionReason(null);
        }
        Application saved = applicationRepository.save(application);

        // Notify Student
        Notification notification = new Notification();
        notification.setUser(application.getStudent().getUser());
        String msg = "Your application status for '" + application.getJob().getJobTitle() + "' at " + application.getJob().getCompanyName() + " has been updated to: " + status.name().replace("_", " ");
        if (status == ApplicationStatus.REJECTED && rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            msg += ". Reason: " + rejectionReason;
        }
        notification.setMessage(msg);
        notificationRepository.save(notification);

        return saved;
    }

    public List<Application> getStudentApplications(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public List<Application> getJobApplicants(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public List<Application> getRecruiterApplicants(Long recruiterId) {
        return applicationRepository.findByJobRecruiterId(recruiterId);
    }
}
