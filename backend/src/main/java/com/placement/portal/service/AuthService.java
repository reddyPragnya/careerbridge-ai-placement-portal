package com.placement.portal.service;

import com.placement.portal.dto.AuthResponse;
import com.placement.portal.dto.LoginRequest;
import com.placement.portal.dto.RegisterRequest;
import com.placement.portal.entity.*;
import com.placement.portal.repository.*;
import com.placement.portal.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RecruiterRepository recruiterRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       RecruiterRepository recruiterRepository,
                       AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.recruiterRepository = recruiterRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public String registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // Create core user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setEnabled(true);
        
        user = userRepository.save(user);

        // Create specific profile based on role
        if (request.getRole() == Role.STUDENT) {
            Student student = new Student();
            student.setUser(user);
            student.setFullName(request.getFullName() != null ? request.getFullName() : "New Student");
            student.setCgpa(0.0);
            student.setGraduationYear(2026);
            student.setDepartment("Computer Science");
            studentRepository.save(student);
        } else if (request.getRole() == Role.RECRUITER) {
            Recruiter recruiter = new Recruiter();
            recruiter.setUser(user);
            recruiter.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : "New Company");
            recruiter.setApproved(false); // Admin must approve
            recruiterRepository.save(recruiter);
        } else if (request.getRole() == Role.ADMIN) {
            Admin admin = new Admin();
            admin.setUser(user);
            admin.setFullName(request.getFullName() != null ? request.getFullName() : "Admin User");
            adminRepository.save(admin);
        }

        return "User registered successfully!";
    }

    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        if (user.isBlocked()) {
            throw new RuntimeException("Your account has been blocked by the Administrator. Please contact support.");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("DEACTIVATED");
        }

        // Fetch profile detail & ID
        Long profileId = null;
        String name = "";
        
        if (user.getRole() == Role.STUDENT) {
            Student s = studentRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            profileId = s.getId();
            name = s.getFullName();
        } else if (user.getRole() == Role.RECRUITER) {
            Recruiter r = recruiterRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
            profileId = r.getId();
            name = r.getCompanyName();
            
            // Note: Recruiter approval check is optionally done inside endpoints 
            // or we can allow login but show warning if not approved.
        } else if (user.getRole() == Role.ADMIN) {
            Admin a = adminRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Admin profile not found"));
            profileId = a.getId();
            name = a.getFullName();
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getId(), profileId, name);
    }

    @Transactional
    public void deactivateUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse reactivateUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        if (user.isBlocked()) {
            throw new RuntimeException("Your account is blocked and cannot be reactivated.");
        }

        user.setEnabled(true);
        userRepository.save(user);

        return loginUser(request);
    }
}
