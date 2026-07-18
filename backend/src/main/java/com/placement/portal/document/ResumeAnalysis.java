package com.placement.portal.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "resume_analyses")
public class ResumeAnalysis {

    @Id
    private String id;

    private Long studentId;
    private String resumeId;
    private Integer atsScore;
    private String summary;
    private List<String> strengths = new ArrayList<>();
    private List<String> weaknesses = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> suggestedImprovements = new ArrayList<>();
    private List<String> recommendedCertifications = new ArrayList<>();
    private List<String> recommendedProjects = new ArrayList<>();
    private List<String> suggestedCareerRoles = new ArrayList<>();
    private Instant analyzedAt;

    public ResumeAnalysis() {
        this.analyzedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getSuggestedImprovements() { return suggestedImprovements; }
    public void setSuggestedImprovements(List<String> suggestedImprovements) { this.suggestedImprovements = suggestedImprovements; }

    public List<String> getRecommendedCertifications() { return recommendedCertifications; }
    public void setRecommendedCertifications(List<String> recommendedCertifications) { this.recommendedCertifications = recommendedCertifications; }

    public List<String> getRecommendedProjects() { return recommendedProjects; }
    public void setRecommendedProjects(List<String> recommendedProjects) { this.recommendedProjects = recommendedProjects; }

    public List<String> getSuggestedCareerRoles() { return suggestedCareerRoles; }
    public void setSuggestedCareerRoles(List<String> suggestedCareerRoles) { this.suggestedCareerRoles = suggestedCareerRoles; }

    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant analyzedAt) { this.analyzedAt = analyzedAt; }
}
