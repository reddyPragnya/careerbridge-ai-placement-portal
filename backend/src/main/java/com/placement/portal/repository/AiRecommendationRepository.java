package com.placement.portal.repository;

import com.placement.portal.document.AiRecommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface AiRecommendationRepository extends MongoRepository<AiRecommendation, String> {
    Optional<AiRecommendation> findTopByStudentIdOrderByRecommendedAtDesc(Long studentId);
    List<AiRecommendation> findByStudentId(Long studentId);
}
