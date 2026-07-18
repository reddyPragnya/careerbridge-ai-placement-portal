package com.placement.portal.repository;

import com.placement.portal.document.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ResumeRepository extends MongoRepository<Resume, String> {
    Optional<Resume> findByStudentId(Long studentId);
}
