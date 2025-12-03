package com.example.iam_service.config;

import com.example.iam_service.entity.User;
import com.example.iam_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

        // Admin & Employees
        seedUser("admin@example.com", "Pham Van Minh", "0901234567", "012345678901",
                "Hanoi, Vietnam", "MALE", 30, LocalDate.of(1995, 5, 12),
                "admin123ADMIN", "ROLE_ADMIN", true, false, null);

        seedUser("labmanager1@example.com", "Nguyen Thi Hong", "0912345678", "023456789012",
                "Ho Chi Minh City, Vietnam", "FEMALE", 28, LocalDate.of(1997, 3, 25),
                "staff123STAFF", "ROLE_LAB_MANAGER", true, false, null);

        seedUser("labuser1@example.com", "Vo Quoc Bao", "0987654321", "034567890123",
                "Da Nang, Vietnam", "MALE", 24, LocalDate.of(2001, 8, 14),
                "member123MEMBER", "ROLE_LAB_USER", true, false, null);

        seedUser("service@example.com", "Tran Hoang Anh", "0978123456", "045678901234",
                "Can Tho, Vietnam", "FEMALE", 22, LocalDate.of(2003, 1, 10),
                "user123USER", "ROLE_SERVICE", true, false, null);

        seedUser("default@example.com", "Phan Tuan Anh", "0923456789", "056789012345",
                "Hai Phong, Vietnam", "MALE", 20, LocalDate.of(2005, 7, 20),
                "guest123GUEST", "ROLE_DEFAULT", true, false, null);

        seedUser("inactive@example.com", "Do Duc Anh", "0911222333", "067890123456",
                "Hue, Vietnam", "MALE", 26, LocalDate.of(1999, 11, 11),
                "inactive123USER", "ROLE_LAB_MANAGER", false, false, null);

        seedUser(
                "staff2@example.com", "Ho Thi Thu", "0908000111", "013245678908",
                "Ha Noi, Vietnam", "MALE", 32, LocalDate.of(1993, 7, 7),
                "staffpassA", "ROLE_LAB_MANAGER",
                true, false, null
        );

        seedUser(
                "staff3@example.com", "Tran Thi Anh Thu", "0908555666", "062345678911",
                "Hue, Vietnam", "FEMALE", 25, LocalDate.of(2000, 4, 14),
                "staffpassB", "ROLE_LAB_USER",
                true, false, null
        );

        seedUser(
                "staff4@example.com", "Pham Quang Huy", "0933888777", "012345679912",
                "Hai Phong, Vietnam", "MALE", 27, LocalDate.of(1998, 2, 8),
                "staffpassC", "ROLE_LAB_USER",
                true, false, null
        );

        seedUser(
                "staff5@example.com", "Nguyen Bao", "0977555666", "012345688912",
                "Can Tho, Vietnam", "MALE", 31, LocalDate.of(1994, 10, 2),
                "staffpassD", "ROLE_SERVICE",
                true, false, null
        );

        seedUser(
                "staff6@example.com", "Do Hoai LinH", "0909777888", "012345008912",
                "Da Lat, Vietnam", "FEMALE", 28, LocalDate.of(1997, 5, 28),
                "staffpassE", "ROLE_LAB_MANAGER",
                true, false, null
        );

        //Patients
        seedUser(
                "ghost1@example.com", "Le Truong Son", "0911222333", "012345100912",
                "Underworld", "MALE", 45, LocalDate.of(1979, 5, 1),
                "ghostpass", "ROLE_PATIENT",
                false, true, LocalDateTime.now().minusDays(10)
        );

        seedUser(
                "soon2die@example.com", "Nguyen Thanh Ha", "0933222111", "012345100933",
                "Limbo City", "FEMALE", 31, LocalDate.of(1994, 10, 20),
                "waitingpass", "ROLE_PATIENT",
                true, false, LocalDateTime.now().plusDays(3).withHour(2).withMinute(59)
        );

        seedUser(
                "patient1@example.com", "Vo Gia Hao", "0905123456", "022345125912",
                "Ha Noi, Vietnam", "MALE", 34, LocalDate.of(1991, 2, 15),
                "patient123A", "ROLE_PATIENT",
                true, false, null
        );

        seedUser(
                "patient2@example.com", "Bui Thu Trang", "0933444555", "020045125912",
                "Ho Chi Minh City, Vietnam", "FEMALE", 29, LocalDate.of(1996, 9, 4),
                "patient123B", "ROLE_PATIENT",
                true, false, null
        );

        seedUser(
                "patient3@example.com", "Pham Khac Tuan", "0977666888", "029745125912",
                "Da Nang, Vietnam", "MALE", 41, LocalDate.of(1984, 11, 22),
                "patient123C", "ROLE_PATIENT",
                true, false, null
        );

        seedUser(
                "ghost2@example.com", "Le My Duyen", "0911888999", "029700125912",
                "Forgotten Town", "FEMALE", 52, LocalDate.of(1973, 1, 1),
                "goneforever", "ROLE_PATIENT",
                false, true, LocalDateTime.now().minusDays(10)
        );

        seedUser(
                "ghost3@example.com", "Tran Quang Hai", "0911555777", "029799125912",
                "Nether City", "MALE", 37, LocalDate.of(1988, 6, 6),
                "vanishsoon", "ROLE_PATIENT",
                false, true, LocalDateTime.now().minusDays(2)
        );

        seedUser(
                "almostgone@example.com", "Bui Kim Yen", "0933999444", "029700725912",
                "Purgatory, Vietnam", "FEMALE", 27, LocalDate.of(1998, 12, 9),
                "halfdead", "ROLE_PATIENT",
                true, false, LocalDateTime.now().plusDays(5).withHour(2).withMinute(59)
        );


        System.out.println("✅ Demo users seeded successfully!");
    }

    private void seedUser(String email, String fullName, String phone, String identity,
                          String address, String gender, int age, LocalDate birthdate,
                          String password, String roleCode, boolean isActive, boolean isDeleted, LocalDateTime deletedAt) {

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
                .isDeleted(isDeleted)
                .deletedAt(deletedAt)
                .build();

        userRepository.save(user);
    }
}
