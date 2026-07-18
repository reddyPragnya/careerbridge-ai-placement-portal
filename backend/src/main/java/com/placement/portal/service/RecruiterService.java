package com.placement.portal.service;

import com.placement.portal.entity.*;
import com.placement.portal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecruiterService {

    private final RecruiterRepository recruiterRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public RecruiterService(RecruiterRepository recruiterRepository,
                            JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            UserRepository userRepository) {
        this.recruiterRepository = recruiterRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    public Recruiter getProfile(Long recruiterId) {
        return recruiterRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
    }

    public Recruiter getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
    }

    @Transactional
    public Recruiter updateProfile(Long recruiterId, Recruiter details) {
        Recruiter recruiter = recruiterRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        recruiter.setCompanyName(details.getCompanyName());
        recruiter.setCompanyWebsite(details.getCompanyWebsite());
        recruiter.setContactNumber(details.getContactNumber());
        recruiter.setDescription(details.getDescription());
        if (details.getCompanyLogoUrl() != null) {
            recruiter.setCompanyLogoUrl(details.getCompanyLogoUrl());
        }

        return recruiterRepository.save(recruiter);
    }

    public Map<String, Object> getAnalytics(Long recruiterId) {
        Recruiter recruiter = recruiterRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        List<Job> jobs = jobRepository.findByRecruiterId(recruiterId);
        long totalJobs = jobs.size();
        
        long applicationsReceived = applicationRepository.countByJobRecruiterId(recruiterId);
        long shortlisted = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SHORTLISTED);
        long rejected = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.REJECTED);
        long selected = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SELECTED);
        long interviewScheduled = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.INTERVIEW_SCHEDULED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", totalJobs);
        stats.put("applicationsReceived", applicationsReceived);
        stats.put("shortlisted", shortlisted);
        stats.put("rejected", rejected);
        stats.put("selected", selected);
        stats.put("interviewScheduled", interviewScheduled);
        
        return stats;
    }
}
