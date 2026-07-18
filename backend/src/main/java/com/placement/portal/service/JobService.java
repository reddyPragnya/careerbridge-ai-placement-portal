package com.placement.portal.service;

import com.placement.portal.entity.Job;
import com.placement.portal.entity.Recruiter;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.RecruiterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final RecruiterRepository recruiterRepository;

    public JobService(JobRepository jobRepository, RecruiterRepository recruiterRepository) {
        this.jobRepository = jobRepository;
        this.recruiterRepository = recruiterRepository;
    }

    @Transactional
    public Job createJob(Job job, Long recruiterId) {
        Recruiter recruiter = recruiterRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (!recruiter.isApproved()) {
            throw new RuntimeException("Your recruiter account is pending approval by the Admin. You cannot post jobs yet.");
        }

        job.setRecruiter(recruiter);
        job.setCompanyName(recruiter.getCompanyName());
        job.setCompanyLogo(recruiter.getCompanyLogoUrl());
        job.setStatus("OPEN");
        return jobRepository.save(job);
    }

    @Transactional
    public Job updateJob(Long jobId, Job details, Long recruiterId, boolean isAdmin) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Authority check
        if (!isAdmin && !job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own job posts.");
        }

        job.setJobTitle(details.getJobTitle());
        job.setPackageDetails(details.getPackageDetails());
        job.setLocation(details.getLocation());
        job.setJobType(details.getJobType());
        job.setEligibilityCgpa(details.getEligibilityCgpa());
        job.setEligibilityDepartment(details.getEligibilityDepartment());
        job.setEligibilitySkills(details.getEligibilitySkills());
        job.setEligibilityGraduationYear(details.getEligibilityGraduationYear());
        job.setRequiredSkills(details.getRequiredSkills());
        job.setDeadline(details.getDeadline());
        job.setDescription(details.getDescription());
        if (details.getStatus() != null) {
            job.setStatus(details.getStatus());
        }

        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(Long jobId, Long recruiterId, boolean isAdmin) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Authority check
        if (!isAdmin && !job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own job posts.");
        }

        jobRepository.delete(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public List<Job> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    public Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }
}
