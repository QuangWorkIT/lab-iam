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
                "admin123ADMIN", "ADMIN");

        seedUser("staff1@example.com", "Tran Thi Staff", "0912345678", "123456789012",
                "Ho Chi Minh City, Vietnam", "FEMALE", 28, LocalDate.of(1997, 3, 25),
                "staff123STAFF", "STAFF");

        seedUser("member1@example.com", "Le Quang Member", "0987654321", "234567890123",
                "Da Nang, Vietnam", "MALE", 24, LocalDate.of(2001, 8, 14),
                "member123MEMBER", "MEMBER");

        seedUser("user1@example.com", "Pham Thi User", "0978123456", "345678901234",
                "Can Tho, Vietnam", "FEMALE", 22, LocalDate.of(2003, 1, 10),
                "user123USER", "USER");

        seedUser("guest@example.com", "Hoang Minh Guest", "0923456789", "456789012345",
                "Hai Phong, Vietnam", "MALE", 20, LocalDate.of(2005, 7, 20),
                "guest123GUEST", "GUEST");

        System.out.println("✅ Demo users seeded successfully!");
    }

    private void seedUser(String email, String fullName, String phone, String identity,
                          String address, String gender, int age, LocalDate birthdate,
                          String password, String roleCode) {

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
                .isActive(true)
                .build();

        userRepository.save(user);
    }
}
