package com.placement.portal.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "ai_recommendations")
public class AiRecommendation {

    @Id
    private String id;

    private Long studentId;
    private List<String> suitableRoles = new ArrayList<>();
    private List<String> learningPath = new ArrayList<>();
    private List<String> courses = new ArrayList<>();
    private List<String> projects = new ArrayList<>();
    private List<String> certifications = new ArrayList<>();
    private Instant recommendedAt;

    public AiRecommendation() {
        this.recommendedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public List<String> getSuitableRoles() { return suitableRoles; }
    public void setSuitableRoles(List<String> suitableRoles) { this.suitableRoles = suitableRoles; }

    public List<String> getLearningPath() { return learningPath; }
    public void setLearningPath(List<String> learningPath) { this.learningPath = learningPath; }

    public List<String> getCourses() { return courses; }
    public void setCourses(List<String> courses) { this.courses = courses; }

    public List<String> getProjects() { return projects; }
    public void setProjects(List<String> projects) { this.projects = projects; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public Instant getRecommendedAt() { return recommendedAt; }
    public void setRecommendedAt(Instant recommendedAt) { this.recommendedAt = recommendedAt; }
}
