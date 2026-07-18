package com.placement.portal.service;

import com.placement.portal.document.Resume;
import com.placement.portal.document.ResumeAnalysis;
import com.placement.portal.entity.Student;
import com.placement.portal.entity.User;
import com.placement.portal.repository.ResumeRepository;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.repository.UserRepository;
import com.placement.portal.util.PdfExtractorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;
    private final UserRepository userRepository;

    public StudentService(StudentRepository studentRepository,
                          ResumeRepository resumeRepository,
                          AiService aiService,
                          UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.resumeRepository = resumeRepository;
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    public Student getProfile(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    public Student getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    @Transactional
    public Student updateProfile(Long studentId, Student details) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        student.setFullName(details.getFullName());
        student.setDepartment(details.getDepartment());
        student.setGraduationYear(details.getGraduationYear());
        student.setCgpa(details.getCgpa());
        student.setSkills(details.getSkills());
        student.setContactNumber(details.getContactNumber());
        student.setAcademicDetails(details.getAcademicDetails());
        if (details.getProfilePicUrl() != null) {
            student.setProfilePicUrl(details.getProfilePicUrl());
        }

        return studentRepository.save(student);
    }

    @Transactional
    public ResumeAnalysis uploadResume(Long studentId, String fileName, String contentType, byte[] fileData) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        try {
            // Extract text from PDF using PDFBox
            String extractedText = PdfExtractorUtil.extractText(new ByteArrayInputStream(fileData));

            // Check if there is an existing resume document for this student
            Optional<Resume> existingResumeOpt = resumeRepository.findByStudentId(studentId);
            Resume resume;
            if (existingResumeOpt.isPresent()) {
                resume = existingResumeOpt.get();
                resume.setFileName(fileName);
                resume.setContentType(contentType);
                resume.setFileData(fileData);
                resume.setExtractedText(extractedText);
            } else {
                resume = new Resume(studentId, fileName, contentType, fileData, extractedText);
            }
            
            resume = resumeRepository.save(resume);

            // Trigger AI Analysis
            ResumeAnalysis analysis = aiService.analyzeResume(extractedText, studentId, resume.getId());

            // Save Resume ID reference to Student profile
            student.setResumeMongoId(resume.getId());
            studentRepository.save(student);

            return analysis;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to upload and parse resume: " + e.getMessage());
        }
    }

    public Resume getResume(Long studentId) {
        return resumeRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("No resume found for this student."));
    }
}
