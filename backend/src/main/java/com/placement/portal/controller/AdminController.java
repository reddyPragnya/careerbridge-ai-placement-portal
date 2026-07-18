package com.placement.portal.controller;

import com.placement.portal.entity.Recruiter;
import com.placement.portal.entity.User;
import com.placement.portal.service.AdminService;
import com.placement.portal.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final JobService jobService;

    public AdminController(AdminService adminService, JobService jobService) {
        this.adminService = adminService;
        this.jobService = jobService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> stats = adminService.getSystemAnalytics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/user/{id}/toggle-block")
    public ResponseEntity<?> toggleBlock(@PathVariable Long id) {
        try {
            adminService.toggleUserBlock(id);
            return ResponseEntity.ok("User block status updated successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/recruiters/pending")
    public ResponseEntity<List<Recruiter>> getPendingRecruiters() {
        List<Recruiter> recruiters = adminService.getPendingRecruiters();
        return ResponseEntity.ok(recruiters);
    }

    @PutMapping("/recruiter/{id}/approve")
    public ResponseEntity<?> approveRecruiter(@PathVariable Long id) {
        try {
            adminService.approveRecruiter(id);
            return ResponseEntity.ok("Recruiter approved successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        try {
            jobService.deleteJob(id, null, true);
            return ResponseEntity.ok("Job deleted by admin successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
