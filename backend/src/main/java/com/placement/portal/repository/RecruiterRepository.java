package com.placement.portal.repository;

import com.placement.portal.entity.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {
    Optional<Recruiter> findByUserId(Long userId);
    List<Recruiter> findByIsApprovedFalse();
}
