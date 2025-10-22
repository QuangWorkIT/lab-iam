package com.example.iam_service.security;

import com.example.iam_service.entity.User;
import com.example.iam_service.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@AllArgsConstructor
public class UserGrantAuthority {

    private final RoleRepository roleRepo;

    public List<GrantedAuthority> getAuthority(User user) {

        try {
            String[] privileges = roleRepo.findPrivilegesByCode(user.getRoleCode())
                    .getPrivileges()
                    .split(",");
            List<GrantedAuthority> authorities = new ArrayList<>();

            // Add role code
            // ex: ROLE_ADMIN
            authorities.add(new SimpleGrantedAuthority(user.getRoleCode()));

            // Add authorities
            // ex: READ_ONLY
            Arrays.stream(privileges).forEach(p -> {
                authorities.add(new SimpleGrantedAuthority(p.trim()));
            });
            return authorities;
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
}
