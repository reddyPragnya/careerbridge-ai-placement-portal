package com.placement.portal.repository;

import com.placement.portal.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationStudentId(Long studentId);
    List<Interview> findByApplicationJobRecruiterId(Long recruiterId);
}
