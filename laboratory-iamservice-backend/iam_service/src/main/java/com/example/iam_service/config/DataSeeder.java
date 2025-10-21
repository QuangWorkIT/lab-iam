package com.example.iam_service.config;

import com.example.iam_service.entity.User;
import com.example.iam_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("⚙️ Users already exist. Skipping seed.");
            return;
        }

        System.out.println("🌱 Seeding initial demo users...");
        seedUser("admin@example.com", "Nguyen Van Admin", "0901234567", "012345678901",
                "Hanoi, Vietnam", "MALE", 30, LocalDate.of(1995, 5, 12),
                "admin123ADMIN", "ROLE_ADMIN", true);

        seedUser("labmanager1@example.com", "Tran Thi Staff", "0912345678", "123456789012",
                "Ho Chi Minh City, Vietnam", "FEMALE", 28, LocalDate.of(1997, 3, 25),
                "staff123STAFF", "ROLE_LAB_MANAGER", true);

        seedUser("labuser1@example.com", "Le Quang Member", "0987654321", "234567890123",
                "Da Nang, Vietnam", "MALE", 24, LocalDate.of(2001, 8, 14),
                "member123MEMBER", "ROLE_LAB_USER", true);

        seedUser("service@example.com", "Pham Thi User", "0978123456", "345678901234",
                "Can Tho, Vietnam", "FEMALE", 22, LocalDate.of(2003, 1, 10),
                "user123USER", "ROLE_SERVICE", true);

        seedUser("default@example.com", "Hoang Minh Guest", "0923456789", "456789012345",
                "Hai Phong, Vietnam", "MALE", 20, LocalDate.of(2005, 7, 20),
                "guest123GUEST", "ROLE_DEFAULT", true);

        seedUser("inactive@example.com", "Lazy Inactive Guy", "0911222333", "567890123456",
                "Hue, Vietnam", "MALE", 26, LocalDate.of(1999, 11, 11),
                "inactive123USER", "ROLE_LAB_MANAGER", false);

        System.out.println("✅ Demo users seeded successfully!");
    }

    private void seedUser(String email, String fullName, String phone, String identity,
                          String address, String gender, int age, LocalDate birthdate,
                          String password, String roleCode, boolean isActive) {

        User user = User.builder()
                .email(email)
                .fullName(fullName)
                .phoneNumber(phone) // auto-encrypted
                .identityNumber(identity) // auto-encrypted
                .address(address) // auto-encrypted
                .gender(gender)
                .age(age)
                .birthdate(birthdate)
                .password(encoder.encode(password))
                .roleCode(roleCode)
                .isActive(isActive)
                .build();

        userRepository.save(user);
    }
}
