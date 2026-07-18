package com.placement.portal.repository;

import com.placement.portal.document.ResumeAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface ResumeAnalysisRepository extends MongoRepository<ResumeAnalysis, String> {
    Optional<ResumeAnalysis> findTopByStudentIdOrderByAnalyzedAtDesc(Long studentId);
    List<ResumeAnalysis> findByStudentId(Long studentId);
}
