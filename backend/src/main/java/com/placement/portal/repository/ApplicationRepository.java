package com.placement.portal.repository;

import com.placement.portal.entity.Application;
import com.placement.portal.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    List<Application> findByJobId(Long jobId);
    List<Application> findByJobRecruiterId(Long recruiterId);
    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);
    
    // Analytics methods
    long countByJobRecruiterId(Long recruiterId);
    long countByJobRecruiterIdAndStatus(Long recruiterId, ApplicationStatus status);
    long countByStatus(ApplicationStatus status);
}
