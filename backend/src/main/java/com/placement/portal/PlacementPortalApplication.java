package com.placement.portal;

import com.placement.portal.entity.*;
import com.placement.portal.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class PlacementPortalApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlacementPortalApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            User adminUser = userRepository.findByEmail("admin@placement.com").orElse(null);
            if (adminUser == null) {
                adminUser = new User();
                adminUser.setEmail("admin@placement.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setRole(Role.ADMIN);
                adminUser.setEnabled(true);
                adminUser.setBlocked(false);
                adminUser = userRepository.save(adminUser);

                Admin adminProfile = new Admin();
                adminProfile.setUser(adminUser);
                adminProfile.setFullName("System Administrator");
                adminRepository.save(adminProfile);

                System.out.println("--------------------------------------------------");
                System.out.println("Default Admin seeded: admin@placement.com / admin123");
                System.out.println("--------------------------------------------------");
            } else {
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setEnabled(true);
                adminUser.setBlocked(false);
                userRepository.save(adminUser);
                System.out.println("--------------------------------------------------");
                System.out.println("Admin password reset on startup: admin@placement.com / admin123");
                System.out.println("--------------------------------------------------");
            }
        };
    }
}
