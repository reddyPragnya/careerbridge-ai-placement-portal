package com.placement.portal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "profile_pic_url")
    private String profilePicUrl;

    private String department;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    private Double cgpa;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "academic_details", columnDefinition = "TEXT")
    private String academicDetails;

    @Column(name = "resume_mongo_id")
    private String resumeMongoId;

    public Student() {}

    public Student(User user, String fullName) {
        this.user = user;
        this.fullName = fullName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getProfilePicUrl() { return profilePicUrl; }
    public void setProfilePicUrl(String profilePicUrl) { this.profilePicUrl = profilePicUrl; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAcademicDetails() { return academicDetails; }
    public void setAcademicDetails(String academicDetails) { this.academicDetails = academicDetails; }

    public String getResumeMongoId() { return resumeMongoId; }
    public void setResumeMongoId(String resumeMongoId) { this.resumeMongoId = resumeMongoId; }
}
