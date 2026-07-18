package com.placement.portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_logo")
    private String companyLogo;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "package_details")
    private String packageDetails; // E.g., "$120,000 / year" or "12 LPA"

    private String location;

    @Column(name = "job_type")
    private String jobType; // Full-Time, Internship, Contract

    @Column(name = "eligibility_cgpa")
    private Double eligibilityCgpa;

    @Column(name = "eligibility_department")
    private String eligibilityDepartment; // Comma-separated departments or 'All'

    @Column(name = "eligibility_skills", columnDefinition = "TEXT")
    private String eligibilitySkills; // Comma-separated list

    @Column(name = "eligibility_graduation_year")
    private Integer eligibilityGraduationYear;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status = "OPEN"; // OPEN, CLOSED

    public Job() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Recruiter getRecruiter() { return recruiter; }
    public void setRecruiter(Recruiter recruiter) { this.recruiter = recruiter; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getPackageDetails() { return packageDetails; }
    public void setPackageDetails(String packageDetails) { this.packageDetails = packageDetails; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public Double getEligibilityCgpa() { return eligibilityCgpa; }
    public void setEligibilityCgpa(Double eligibilityCgpa) { this.eligibilityCgpa = eligibilityCgpa; }

    public String getEligibilityDepartment() { return eligibilityDepartment; }
    public void setEligibilityDepartment(String eligibilityDepartment) { this.eligibilityDepartment = eligibilityDepartment; }

    public String getEligibilitySkills() { return eligibilitySkills; }
    public void setEligibilitySkills(String eligibilitySkills) { this.eligibilitySkills = eligibilitySkills; }

    public Integer getEligibilityGraduationYear() { return eligibilityGraduationYear; }
    public void setEligibilityGraduationYear(Integer eligibilityGraduationYear) { this.eligibilityGraduationYear = eligibilityGraduationYear; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
