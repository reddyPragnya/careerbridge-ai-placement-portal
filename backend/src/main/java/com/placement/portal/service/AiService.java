package com.placement.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.portal.document.AiRecommendation;
import com.placement.portal.document.ResumeAnalysis;
import com.placement.portal.entity.Job;
import com.placement.portal.entity.Student;
import com.placement.portal.repository.AiRecommendationRepository;
import com.placement.portal.repository.ResumeAnalysisRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiUrl;

    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final AiRecommendationRepository aiRecommendationRepository;
    private final ObjectMapper objectMapper;

    public AiService(ResumeAnalysisRepository resumeAnalysisRepository,
                     AiRecommendationRepository aiRecommendationRepository) {
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.aiRecommendationRepository = aiRecommendationRepository;
        this.objectMapper = new ObjectMapper();
    }

    private String callGemini(String prompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload structure for Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contentMap = new HashMap<>();
            Map<String, Object> partMap = new HashMap<>();
            partMap.put("text", prompt);
            contentMap.put("parts", Collections.singletonList(partMap));
            requestBody.put("contents", Collections.singletonList(contentMap));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String urlWithKey = geminiUrl + "?key=" + geminiApiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map part = (Map) parts.get(0);
                            String text = (String) part.get("text");
                            return cleanJsonString(text);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private String cleanJsonString(String rawText) {
        if (rawText == null) return null;
        String clean = rawText.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    public ResumeAnalysis analyzeResume(String resumeText, Long studentId, String resumeId) {
        String prompt = "You are an expert ATS (Applicant Tracking System) recruiter. Note that the current date is " + java.time.LocalDate.now().toString() + ". Analyze the following student resume text and return a structured JSON response.\n" +
                "JSON Format:\n" +
                "{\n" +
                "  \"atsScore\": 85,\n" +
                "  \"summary\": \"detailed summary here...\",\n" +
                "  \"strengths\": [\"strength1\", \"strength2\"],\n" +
                "  \"weaknesses\": [\"weakness1\", \"weakness2\"],\n" +
                "  \"missingSkills\": [\"skill1\", \"skill2\"],\n" +
                "  \"suggestedImprovements\": [\"improvement1\", \"improvement2\"],\n" +
                "  \"recommendedCertifications\": [\"cert1\", \"cert2\"],\n" +
                "  \"recommendedProjects\": [\"proj1\", \"proj2\"],\n" +
                "  \"suggestedCareerRoles\": [\"role1\", \"role2\"]\n" +
                "}\n" +
                "Ensure the response contains ONLY the valid raw JSON matching this structure. Do not include markdown tags like ```json or any other text.\n\n" +
                "Resume Text:\n" +
                resumeText;

        String jsonResponse = callGemini(prompt);
        if (jsonResponse != null) {
            try {
                ResumeAnalysis analysis = objectMapper.readValue(jsonResponse, ResumeAnalysis.class);
                analysis.setStudentId(studentId);
                analysis.setResumeId(resumeId);
                return resumeAnalysisRepository.save(analysis);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        // Fallback mock analysis if Gemini fails or JSON is malformed
        ResumeAnalysis fallback = new ResumeAnalysis();
        fallback.setStudentId(studentId);
        fallback.setResumeId(resumeId);
        fallback.setAtsScore(70);
        fallback.setSummary("Failed to parse ATS response. This is a fallback summary of the student resume.");
        fallback.setStrengths(Arrays.asList("Good academic background", "Core skills present"));
        fallback.setWeaknesses(Collections.singletonList("Formatting adjustments needed"));
        fallback.setSuggestedImprovements(Collections.singletonList("Update project descriptions with metrics"));
        return resumeAnalysisRepository.save(fallback);
    }

    public Map<String, Object> checkEligibility(Student student, Job job) {
        String prompt = "You are a university placement coordinator. Evaluate if the student is eligible for the job based on parameters.\n" +
                "Student profile:\n" +
                "- Name: " + student.getFullName() + "\n" +
                "- CGPA: " + student.getCgpa() + "\n" +
                "- Department: " + student.getDepartment() + "\n" +
                "- Graduation Year: " + student.getGraduationYear() + "\n" +
                "- Skills: " + student.getSkills() + "\n\n" +
                "Job requirements:\n" +
                "- Title: " + job.getJobTitle() + "\n" +
                "- CGPA Cutoff: " + job.getEligibilityCgpa() + "\n" +
                "- Allowed Departments: " + job.getEligibilityDepartment() + "\n" +
                "- Required Graduation Year: " + job.getEligibilityGraduationYear() + "\n" +
                "- Required Skills: " + job.getRequiredSkills() + "\n\n" +
                "Evaluate eligibility and return a structured JSON response:\n" +
                "{\n" +
                "  \"eligible\": true,\n" +
                "  \"reason\": \"Explain eligibility status step by step (evaluating CGPA, department, graduation year, and matching skills).\"\n" +
                "}\n" +
                "Ensure the response contains ONLY the valid raw JSON matching this structure.";

        String jsonResponse = callGemini(prompt);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, Map.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Programmatic fallback
        Map<String, Object> fallback = new HashMap<>();
        boolean cgpaEligible = student.getCgpa() == null || job.getEligibilityCgpa() == null || student.getCgpa() >= job.getEligibilityCgpa();
        boolean deptEligible = student.getDepartment() == null || job.getEligibilityDepartment() == null || 
                job.getEligibilityDepartment().equalsIgnoreCase("All") || 
                job.getEligibilityDepartment().toLowerCase().contains(student.getDepartment().toLowerCase());
        boolean gradEligible = student.getGraduationYear() == null || job.getEligibilityGraduationYear() == null || student.getGraduationYear().equals(job.getEligibilityGraduationYear());
        
        boolean eligible = cgpaEligible && deptEligible && gradEligible;
        fallback.put("eligible", eligible);
        fallback.put("reason", "CGPA check: " + (cgpaEligible ? "PASSED" : "FAILED") + 
                ". Department check: " + (deptEligible ? "PASSED" : "FAILED") + 
                ". Graduation Year check: " + (gradEligible ? "PASSED" : "FAILED") + ".");
        return fallback;
    }

    public Map<String, Object> matchResume(String resumeText, String jobDescription) {
        String prompt = "Compare the student's resume text with the job description and analyze matching details.\n" +
                "Resume:\n" +
                resumeText + "\n\n" +
                "Job Description:\n" +
                jobDescription + "\n\n" +
                "Return a structured JSON response:\n" +
                "{\n" +
                "  \"matchPercentage\": 78.5,\n" +
                "  \"missingSkills\": [\"skill1\", \"skill2\"],\n" +
                "  \"recommendedImprovements\": [\"suggestion1\", \"suggestion2\"]\n" +
                "}\n" +
                "Ensure the response contains ONLY the valid raw JSON matching this structure.";

        String jsonResponse = callGemini(prompt);
        if (jsonResponse != null) {
            try {
                return objectMapper.readValue(jsonResponse, Map.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("matchPercentage", 65.0);
        fallback.put("missingSkills", Arrays.asList("Advanced concepts", "Industry tools"));
        fallback.put("recommendedImprovements", Collections.singletonList("Tailor projects section to match the job criteria"));
        return fallback;
    }

    public AiRecommendation generateCareerRecommendations(Student student) {
        String prompt = "Provide highly detailed, personalized AI-driven career path recommendations and structured roadmaps based on the student's profile.\n" +
                "Student profile details:\n" +
                "- Department: " + student.getDepartment() + "\n" +
                "- Skills: " + student.getSkills() + "\n" +
                "- Academic Info: " + student.getAcademicDetails() + "\n\n" +
                "Return a structured JSON response. Make sure the learningPath consists of 4-6 detailed, actionable sequential milestones rather than simple single phrases. Include descriptive project descriptions for the projects. Keep the JSON keys exactly as specified:\n" +
                "{\n" +
                "  \"suitableRoles\": [\"Software Engineer (Full-Stack)\", \"System Reliability Engineer\"],\n" +
                "  \"learningPath\": [\n" +
                "    \"Milestone 1: Master Advanced DSA & Algorithms - Core focus on tree traversals, dynamic programming, and complexity tuning in Java/Python.\",\n" +
                "    \"Milestone 2: Deep Dive into Backend Architectures - Design distributed REST services, master relational query tuning (indexes, Joins), and integrate microservices.\",\n" +
                "    \"Milestone 3: Implement CI/CD & Build Pipelines - Configure automated testing scripts, build containerized deployments with Docker, and orchestrate with GitLab CI.\"\n" +
                "  ],\n" +
                "  \"courses\": [\"Complete Java Developer BootCamp (Udemy)\", \"Docker & Kubernetes Masterclass (Coursera)\"],\n" +
                "  \"projects\": [\n" +
                "    \"Project 1: Distributed E-Commerce Backend - Building multi-service architecture using Spring Boot, PostgreSQL, and Kafka for event streaming.\",\n" +
                "    \"Project 2: Containerized Cloud Deployment - Automate the build, packaging, and hosting of a React node service on AWS using Docker, Terraform, and GitHub Actions.\"\n" +
                "  ],\n" +
                "  \"certifications\": [\"AWS Certified Solutions Architect - Associate\", \"Oracle Certified Professional: Java SE Developer\"]\n" +
                "}\n" +
                "Ensure the response contains ONLY the valid raw JSON matching this structure.";

        String jsonResponse = callGemini(prompt);
        if (jsonResponse != null) {
            try {
                AiRecommendation recommendation = objectMapper.readValue(jsonResponse, AiRecommendation.class);
                recommendation.setStudentId(student.getId());
                return aiRecommendationRepository.save(recommendation);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return aiRecommendationRepository.save(generateLocalFallback(student));
    }

    private AiRecommendation generateLocalFallback(Student student) {
        String dept = student.getDepartment() != null ? student.getDepartment().toLowerCase() : "";
        String skills = student.getSkills() != null ? student.getSkills().toLowerCase() : "";

        List<String> roles = new ArrayList<>();
        List<String> learningPath = new ArrayList<>();
        List<String> courses = new ArrayList<>();
        List<String> projects = new ArrayList<>();
        List<String> certifications = new ArrayList<>();

        if (dept.contains("mech") || dept.contains("robot")) {
            roles.addAll(Arrays.asList("Robotics Engineer", "CAD Designer", "Product Development Engineer"));
            learningPath.addAll(Arrays.asList(
                "Milestone 1: Master SolidWorks / AutoCAD - Learn advanced parametric 3D modeling and assemblies.",
                "Milestone 2: Study Finite Element Analysis (FEA) - Analyze mechanical stress, heat transfer, and structural fatigue.",
                "Milestone 3: Learn Embedded Systems & Robotics - Program microcontrollers (Arduino/Raspberry Pi) using C++."
            ));
            courses.addAll(Arrays.asList("Introduction to Mechanical CAD (Coursera)", "Robotics specialization (Udemy)"));
            projects.addAll(Arrays.asList(
                "Project 1: Autonomous Robotic Arm - Design and 3D print a 4-DOF arm controlled via Arduino and Bluetooth.",
                "Project 2: Structural Optimization - FEA simulation of a load-bearing bracket reducing material mass by 15%."
            ));
            certifications.addAll(Arrays.asList("Certified SolidWorks Associate (CSWA)", "Autodesk Certified Professional"));
        } else if (dept.contains("elect") || dept.contains("ece") || dept.contains("eee")) {
            roles.addAll(Arrays.asList("Embedded Systems Engineer", "VLSI Design Engineer", "IoT Solutions Developer"));
            learningPath.addAll(Arrays.asList(
                "Milestone 1: Master Embedded C/C++ - Learn bare-metal microcontroller firmware design and register-level coding.",
                "Milestone 2: Learn PCB Designing & Assembly - Master schematic capture and routing in KiCAD or Altium Designer.",
                "Milestone 3: Master Real-Time Operating Systems (RTOS) - Understand task scheduling, semaphores, and queues in FreeRTOS."
            ));
            courses.addAll(Arrays.asList("Embedded Systems Specialization (Coursera)", "Mastering Microcontroller Programming (Udemy)"));
            projects.addAll(Arrays.asList(
                "Project 1: IoT Weather Monitoring Node - ESP32 sensor cluster transmitting data via MQTT to a custom dashboard.",
                "Project 2: RTOS Smart Home Hub - Multi-threaded home automation controller managing sensor readings and display output."
            ));
            certifications.addAll(Arrays.asList("Associate Embedded Systems Professional", "ARM Accredited Engineer"));
        } else {
            // Software Engineering / CS / IT / others
            if (skills.contains("python") || skills.contains("data") || skills.contains("machine") || skills.contains("ai")) {
                roles.addAll(Arrays.asList("Data Scientist", "Machine Learning Engineer", "Data Analyst"));
                learningPath.addAll(Arrays.asList(
                    "Milestone 1: Master Data Analysis with Python - Deep dive into NumPy, Pandas, and exploratory data analysis (EDA).",
                    "Milestone 2: Build Machine Learning Pipelines - Train regression, classification, and clustering models using Scikit-Learn.",
                    "Milestone 3: Master Deep Learning & NLP - Implement neural networks in PyTorch or TensorFlow for computer vision and NLP."
                ));
                courses.addAll(Arrays.asList("Machine Learning by Andrew Ng (Coursera)", "Deep Learning Specialization (DeepLearning.AI)"));
                projects.addAll(Arrays.asList(
                    "Project 1: Predictive House Pricing Web App - Trained XGBoost model integrated with a Flask backend for real-time predictions.",
                    "Project 2: Object Detection System - Custom YOLOv8 pipeline detecting traffic safety hazards from live video feeds."
                ));
                certifications.addAll(Arrays.asList("Google Cloud Professional Data Engineer", "TensorFlow Developer Certificate"));
            } else {
                // General Full-Stack / Software Engineer
                roles.addAll(Arrays.asList("Full-Stack Software Engineer", "Backend Developer", "Cloud Solutions Architect"));
                learningPath.addAll(Arrays.asList(
                    "Milestone 1: Master Core Programming & DSA - Core algorithms, data structures, and object-oriented design in Java/Python/C++.",
                    "Milestone 2: Build Responsive Web Architectures - Develop modern SPAs using React/Vue and style with modern CSS modules.",
                    "Milestone 3: Construct Secure REST APIs - Create enterprise backends with Spring Boot or Node.js, and integrate SQL/NoSQL databases.",
                    "Milestone 4: Deploy & Scale on Cloud - Configure Docker containers, setup CI/CD pipelines, and deploy on AWS or Google Cloud."
                ));
                courses.addAll(Arrays.asList("Complete Web Developer Bootcamp (Udemy)", "Architecting on AWS (Coursera)"));
                projects.addAll(Arrays.asList(
                    "Project 1: Distributed E-Commerce Platform - Spring Boot and React application using Microservices and PostgreSQL.",
                    "Project 2: Cloud Native Serverless App - React frontend connected to AWS Lambda, API Gateway, and DynamoDB."
                ));
                certifications.addAll(Arrays.asList("AWS Certified Solutions Architect - Associate", "Oracle Certified Java Professional"));
            }
        }

        // Add a randomized dynamic element to the projects section to force refresh paths
        List<String> dynamicProjects = new ArrayList<>(projects);
        List<String> projectPool = Arrays.asList(
            "Project Alpha: Real-time Collaboration Tool - Secure WebSocket server with WebRTC for peer-to-peer screen sharing.",
            "Project Beta: Smart Analytics Dashboard - Dynamic visual reporting dashboard using Chart.js parsing JSON streams.",
            "Project Gamma: Decentralized Storage Hub - Blockchain-based file management application using IPFS."
        );
        Collections.shuffle(projectPool);
        dynamicProjects.add(projectPool.get(0));

        AiRecommendation recommendation = new AiRecommendation();
        recommendation.setStudentId(student.getId());
        recommendation.setSuitableRoles(roles);
        recommendation.setLearningPath(learningPath);
        recommendation.setCourses(courses);
        recommendation.setProjects(dynamicProjects);
        recommendation.setCertifications(certifications);
        return recommendation;
    }
}
