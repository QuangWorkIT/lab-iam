package com.example.iam_service.security;

import com.example.iam_service.entity.Role;
import com.example.iam_service.entity.User;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.repository.RoleRepository;
import com.example.iam_service.util.PrivilegesConverter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.EnumSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserGrantAuthorityTest {

    @Mock
    private PrivilegesConverter privilegesConverter;

    @Mock
    private RoleRepository roleRepo;

    @InjectMocks
    private UserGrantAuthority userGrantAuthority;

    private User user;
    private Role role;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setRoleCode("ROLE_ADMIN");

        role = new Role();
        role.setPrivileges(EnumSet.of(Privileges.VIEW_USER, Privileges.CREATE_USER));
    }

    @Test
    @DisplayName("Should return authorities including role and privileges")
    void getAuthorityByUser_ShouldReturnAuthorities() {
        // Arrange
        when(roleRepo.findPrivilegesByCode("ROLE_ADMIN")).thenReturn(role);
        when(privilegesConverter.convertToDatabaseColumn(role.getPrivileges()))
                .thenReturn("VIEW_USER,CREATE_USER");

        // Act
        List<GrantedAuthority> authorities = userGrantAuthority.getAuthorityByUser(user);

        // Assert
        assertNotNull(authorities);
        assertEquals(3, authorities.size()); // ROLE_ADMIN + VIEW_USER + CREATE_USER
        assertTrue(authorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
        assertTrue(authorities.contains(new SimpleGrantedAuthority("VIEW_USER")));
        assertTrue(authorities.contains(new SimpleGrantedAuthority("CREATE_USER")));

        verify(roleRepo, times(1)).findPrivilegesByCode("ROLE_ADMIN");
        verify(privilegesConverter, times(1)).convertToDatabaseColumn(role.getPrivileges());
    }

    @Test
    @DisplayName("Should throw RuntimeException if roleRepo throws exception")
    void getAuthorityByUser_ShouldThrowRuntimeException_WhenRoleRepoFails() {
        // Arrange
        when(roleRepo.findPrivilegesByCode("ROLE_ADMIN")).thenThrow(new RuntimeException("DB error"));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            userGrantAuthority.getAuthorityByUser(user);
        });

        assertTrue(ex.getMessage().contains("DB error"));
        verify(roleRepo, times(1)).findPrivilegesByCode("ROLE_ADMIN");
        verifyNoInteractions(privilegesConverter);
    }

    @Test
    @DisplayName("Should throw RuntimeException if privilegesConverter throws exception")
    void getAuthorityByUser_ShouldThrowRuntimeException_WhenPrivilegesConverterFails() {
        // Arrange
        when(roleRepo.findPrivilegesByCode("ROLE_ADMIN")).thenReturn(role);
        when(privilegesConverter.convertToDatabaseColumn(role.getPrivileges()))
                .thenThrow(new RuntimeException("Conversion failed"));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            userGrantAuthority.getAuthorityByUser(user);
        });

        assertTrue(ex.getMessage().contains("Conversion failed"));
        verify(roleRepo, times(1)).findPrivilegesByCode("ROLE_ADMIN");
        verify(privilegesConverter, times(1)).convertToDatabaseColumn(role.getPrivileges());
    }
}