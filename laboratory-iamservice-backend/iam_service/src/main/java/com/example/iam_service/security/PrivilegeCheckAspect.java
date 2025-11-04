package com.example.iam_service.security;


import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.entity.User;
import com.example.iam_service.exception.InsufficientPrivilegesException;
import com.example.iam_service.service.RoleService;
import com.example.iam_service.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Optional;

@Aspect
@Component
@Slf4j
public class PrivilegeCheckAspect {

    @Autowired
    private UserService service;

    @Autowired
    private RoleService roleService;

    @Before("@annotation(com.example.iam_service.security.PrivilegesRequired)")
    public void checkPrivileges(JoinPoint joinPoint) {
        log.info("Privilege check verification started");
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        PrivilegesRequired annotation = signature.getMethod().getAnnotation(PrivilegesRequired.class);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Access denied. User session is empty or not authenticated.");
            throw new InsufficientPrivilegesException("User not authenticated");
        } else {
            //Extracting email from principal because jwt return a whole user object
            Object principal = authentication.getPrincipal();
            String email;
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else if (principal instanceof User) {
                email = ((User) principal).getEmail();
            } else {
                email = authentication.getName();
            }

            log.info("Current user email: {}", email);
            Optional<User> current = service.getUserByEmail(email);
            if (!current.isPresent()) {
                log.warn("User not found.");
                throw new InsufficientPrivilegesException("User not found");
            }
            User currentU = current.get();
            Optional<Role> roleOpt = roleService.getRoleByCode(currentU.getRoleCode());
            if(!roleOpt.isPresent())
            {
                log.warn("Access denied: Role '{}' not found for user '{}'",
                        currentU.getRoleCode(), email);
                throw new InsufficientPrivilegesException("User role not found");
            }
            Role userRole = roleOpt.get();
            //Current user's privileges set
            EnumSet<Privileges> currentUserPrivileges = userRole.getPrivileges();
            //Method's required privilege
            Privileges[] privileges = annotation.values();
            boolean requireAll = annotation.requireAll();
            boolean hasAccess = checkPrivileges(currentUserPrivileges,privileges,requireAll);
            if(!hasAccess)
            {
                log.warn("Access denied for user '{}'. Required privileges: {}, User privileges: {}",
                        email, Arrays.toString(privileges), currentUserPrivileges);
                throw new InsufficientPrivilegesException(annotation.message());
            }
        }
    }

    public boolean checkPrivileges(EnumSet<Privileges> privilegesEnumSet, Privileges[] privileges, boolean requiredAll) {
        if (privilegesEnumSet == null || privilegesEnumSet.isEmpty()) {
            return false;
        } else if (requiredAll) {
            //Must have all
            return Arrays.stream(privileges).anyMatch(privilegesEnumSet::contains);
        } else {
            //Must have at least 1
            return Arrays.stream(privileges).anyMatch(privilegesEnumSet::contains);
        }
    }
}
