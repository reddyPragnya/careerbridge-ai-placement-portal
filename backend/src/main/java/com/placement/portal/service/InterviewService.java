package com.placement.portal.service;

import com.placement.portal.entity.*;
import com.placement.portal.repository.ApplicationRepository;
import com.placement.portal.repository.InterviewRepository;
import com.placement.portal.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;

    public InterviewService(InterviewRepository interviewRepository,
                            ApplicationRepository applicationRepository,
                            NotificationRepository notificationRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Interview scheduleInterview(Long applicationId, LocalDateTime date, String type, String location, String description) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setInterviewDate(date);
        interview.setInterviewType(type);
        interview.setLocationOrLink(location);
        interview.setDescription(description);
        interview.setStatus("SCHEDULED");

        Interview saved = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        // Notify student
        Notification notification = new Notification();
        notification.setUser(application.getStudent().getUser());
        notification.setMessage("Interview scheduled for '" + application.getJob().getJobTitle() + "' on " + date.toString() + ". Type: " + type + ". Join details: " + location);
        notificationRepository.save(notification);

        return saved;
    }

    @Transactional
    public Interview updateInterviewStatus(Long interviewId, String status) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        interview.setStatus(status);
        Interview saved = interviewRepository.save(interview);

        // Notify student
        Notification notification = new Notification();
        notification.setUser(interview.getApplication().getStudent().getUser());
        notification.setMessage("Your interview status for '" + interview.getApplication().getJob().getJobTitle() + "' has been updated to: " + status);
        notificationRepository.save(notification);

        return saved;
    }

    public List<Interview> getStudentInterviews(Long studentId) {
        return interviewRepository.findByApplicationStudentId(studentId);
    }

    public List<Interview> getRecruiterInterviews(Long recruiterId) {
        return interviewRepository.findByApplicationJobRecruiterId(recruiterId);
    }
}
