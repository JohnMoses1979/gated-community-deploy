package com.bsgated.config;

import com.bsgated.model.User;
import com.bsgated.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedSuperAdminConfig {

    private static final Logger log = LoggerFactory.getLogger(SeedSuperAdminConfig.class);

    @Bean
    CommandLineRunner seedSuperAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.superadmin.enabled:true}") boolean enabled,
            @Value("${app.seed.superadmin.phone:9000000000}") String phone,
            @Value("${app.seed.superadmin.password:admin123}") String password,
            @Value("${app.seed.superadmin.name:Development Super Admin}") String name) {
        return args -> {
            if (!enabled) {
                return;
            }

            // Seed SuperAdmin
            String normalizedPhone = phone == null ? "" : phone.trim();
            if (!normalizedPhone.isBlank()) {
                userRepository.findByPhone(normalizedPhone).ifPresentOrElse(
                        existing -> log.info("SuperAdmin seed skipped. Account already exists for phone={}", normalizedPhone),
                        () -> {
                            User user = new User();
                            user.setName(name);
                            user.setPhone(normalizedPhone);
                            user.setPassword(passwordEncoder.encode(password));
                            user.setRole("superadmin");
                            user.setVerificationStatus("approved");
                            user.setApprovalStatus("approved");
                            userRepository.save(user);
                            log.info("Seeded development SuperAdmin account phone={}", normalizedPhone);
                        });
            }

            // Seed default Builder (9988776655)
            String builderPhone = "9988776655";
            userRepository.findByPhone(builderPhone).ifPresentOrElse(
                    existing -> log.info("Builder seed skipped. Account already exists for phone={}", builderPhone),
                    () -> {
                        User user = new User();
                        user.setName("Builder Corp");
                        user.setPhone(builderPhone);
                        user.setPassword(passwordEncoder.encode("pass123"));
                        user.setRole("builder");
                        user.setVerificationStatus("approved");
                        user.setApprovalStatus("approved");
                        userRepository.save(user);
                        log.info("Seeded development Builder account phone={}", builderPhone);
                    });

            // Seed default Customer (9000001111)
            String customerPhone = "9000001111";
            userRepository.findByPhone(customerPhone).ifPresentOrElse(
                    existing -> log.info("Customer seed skipped. Account already exists for phone={}", customerPhone),
                    () -> {
                        User user = new User();
                        user.setName("Demo Customer");
                        user.setPhone(customerPhone);
                        user.setPassword(passwordEncoder.encode("customer-9000001111"));
                        user.setRole("customer");
                        user.setVerificationStatus("approved");
                        user.setApprovalStatus("approved");
                        userRepository.save(user);
                        log.info("Seeded development Customer account phone={}", customerPhone);
                    });
        };
    }
}
