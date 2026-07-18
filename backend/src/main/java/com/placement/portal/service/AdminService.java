package com.placement.portal.service;

import com.placement.portal.entity.*;
import com.placement.portal.repository.*;
import com.placement.portal.document.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RecruiterRepository recruiterRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final AiRecommendationRepository aiRecommendationRepository;
    private final AdminRepository adminRepository;
    private final NotificationRepository notificationRepository;

    public AdminService(UserRepository userRepository,
                        StudentRepository studentRepository,
                        RecruiterRepository recruiterRepository,
                        JobRepository jobRepository,
                        ApplicationRepository applicationRepository,
                        InterviewRepository interviewRepository,
                        ResumeRepository resumeRepository,
                        ResumeAnalysisRepository resumeAnalysisRepository,
                        AiRecommendationRepository aiRecommendationRepository,
                        AdminRepository adminRepository,
                        NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.recruiterRepository = recruiterRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.aiRecommendationRepository = aiRecommendationRepository;
        this.adminRepository = adminRepository;
        this.notificationRepository = notificationRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void toggleUserBlock(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(!user.isBlocked());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUserId(userId).orElse(null);
            if (student != null) {
                // 1. Delete interviews linked to student applications
                List<Interview> interviews = interviewRepository.findByApplicationStudentId(student.getId());
                interviewRepository.deleteAll(interviews);

                // 2. Delete applications
                List<Application> apps = applicationRepository.findByStudentId(student.getId());
                applicationRepository.deleteAll(apps);

                // 3. Delete resume PDF from MongoDB
                resumeRepository.findByStudentId(student.getId()).ifPresent(resumeRepository::delete);

                // 4. Delete MongoDB resume analyses
                List<ResumeAnalysis> analyses = resumeAnalysisRepository.findByStudentId(student.getId());
                resumeAnalysisRepository.deleteAll(analyses);

                // 5. Delete MongoDB career roadmaps
                List<AiRecommendation> recommendations = aiRecommendationRepository.findByStudentId(student.getId());
                aiRecommendationRepository.deleteAll(recommendations);

                // 6. Delete student profile row
                studentRepository.delete(student);
            }
        } else if (user.getRole() == Role.RECRUITER) {
            Recruiter recruiter = recruiterRepository.findByUserId(userId).orElse(null);
            if (recruiter != null) {
                // 1. Delete interviews scheduled by recruiter
                List<Interview> interviews = interviewRepository.findByApplicationJobRecruiterId(recruiter.getId());
                interviewRepository.deleteAll(interviews);

                // 2. Delete jobs and their application dependencies
                List<Job> jobs = jobRepository.findByRecruiterId(recruiter.getId());
                for (Job job : jobs) {
                    List<Application> apps = applicationRepository.findByJobId(job.getId());
                    applicationRepository.deleteAll(apps);
                    jobRepository.delete(job);
                }

                // 3. Delete recruiter profile row
                recruiterRepository.delete(recruiter);
            }
        } else if (user.getRole() == Role.ADMIN) {
            adminRepository.findByUserId(userId).ifPresent(adminRepository::delete);
        }

        // Delete notifications linked to the user
        notificationRepository.deleteByUserId(userId);

        // Finally delete the login credentials
        userRepository.delete(user);
    }

    public List<Recruiter> getPendingRecruiters() {
        return recruiterRepository.findByIsApprovedFalse();
    }

    @Transactional
    public void approveRecruiter(Long recruiterId) {
        Recruiter recruiter = recruiterRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
        recruiter.setApproved(true);
        recruiterRepository.save(recruiter);
    }

    public Map<String, Object> getSystemAnalytics() {
        long totalStudents = studentRepository.count();
        long totalRecruiters = recruiterRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long selectedStudents = applicationRepository.countByStatus(ApplicationStatus.SELECTED);

        // Department-wise placement calculation
        Map<String, Long> departmentPlacements = new HashMap<>();
        List<Application> selections = applicationRepository.findAll().stream()
                .filter(app -> app.getStatus() == ApplicationStatus.SELECTED)
                .toList();
        
        for (Application app : selections) {
            String dept = app.getStudent().getDepartment();
            if (dept != null && !dept.isEmpty()) {
                departmentPlacements.put(dept, departmentPlacements.getOrDefault(dept, 0L) + 1);
            }
        }

        // Popular skills tracker
        Map<String, Integer> popularSkills = new HashMap<>();
        List<Student> students = studentRepository.findAll();
        for (Student s : students) {
            if (s.getSkills() != null) {
                String[] skillArr = s.getSkills().split(",");
                for (String sk : skillArr) {
                    String trimSk = sk.trim();
                    if (!trimSk.isEmpty()) {
                        popularSkills.put(trimSk, popularSkills.getOrDefault(trimSk, 0) + 1);
                    }
                }
            }
        }

        // Sort skills and keep top 5
        List<Map.Entry<String, Integer>> skillList = new ArrayList<>(popularSkills.entrySet());
        skillList.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        List<Map<String, Object>> skillsData = new ArrayList<>();
        for (int i = 0; i < Math.min(5, skillList.size()); i++) {
            Map<String, Object> skillMap = new HashMap<>();
            skillMap.put("name", skillList.get(i).getKey());
            skillMap.put("value", skillList.get(i).getValue());
            skillsData.add(skillMap);
        }

        // Mock monthly registrations & application trends for charts
        List<Map<String, Object>> monthlyRegistrations = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"};
        int[] regCounts = {5, 10, 15, 22, 35, 45, 52};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", months[i]);
            m.put("registrations", regCounts[i]);
            monthlyRegistrations.add(m);
        }

        List<Map<String, Object>> applicationsTrend = new ArrayList<>();
        int[] appCounts = {12, 25, 40, 58, 85, 120, 142};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", months[i]);
            m.put("applications", appCounts[i]);
            applicationsTrend.add(m);
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalStudents", totalStudents);
        analytics.put("totalRecruiters", totalRecruiters);
        analytics.put("totalJobs", totalJobs);
        analytics.put("totalApplications", totalApplications);
        analytics.put("selectedStudents", selectedStudents);
        analytics.put("departmentPlacements", departmentPlacements);
        analytics.put("popularSkills", skillsData);
        analytics.put("monthlyRegistrations", monthlyRegistrations);
        analytics.put("applicationsTrend", applicationsTrend);

        return analytics;
    }
}
