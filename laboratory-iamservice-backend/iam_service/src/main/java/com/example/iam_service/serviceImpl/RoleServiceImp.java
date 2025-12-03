package com.example.iam_service.serviceImpl;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.entity.User;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.exception.RoleDeletionException;
import com.example.iam_service.exception.RoleIsFixedException;
import com.example.iam_service.exception.RoleNotFoundException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.repository.RoleRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.security.PrivilegesRequired;
import com.example.iam_service.service.RoleService;
import com.example.iam_service.util.SecurityUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.text.html.Option;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor

public class RoleServiceImp implements RoleService {
    private final AuditPublisher auditPublisher;
    private final SecurityUtil securityUtil;
    private final RoleRepository roleRepository;
    private final RoleMapper mapper;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

//    @Autowired
//    private RoleRepository roleRepository;
//
//    @Autowired
//    private RoleMapper mapper;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private EntityManager entityManager;
    @Transactional(readOnly = true)
    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Override
    @PrivilegesRequired(values = Privileges.VIEW_ROLE, requireAll = true)
    public Page<Role> getRolesPaged(Pageable pageable) {
        return roleRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Override
    @PrivilegesRequired(values = Privileges.VIEW_ROLE, requireAll = true)
    public Optional<Role> getRoleByCode(String code) {
        return roleRepository.findById(code);
    }

    @Transactional(readOnly = true)
    @Override
    @PrivilegesRequired(values = Privileges.VIEW_ROLE, requireAll = true)
    public List<Role> searchRolesByName(String name) {
        return roleRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    @Override
    @PrivilegesRequired(values = Privileges.VIEW_ROLE, requireAll = true)
    public List<Role> searchRoles(String keyword, LocalDate fromDate, LocalDate toDate) {
        return searchRoles(keyword, fromDate, toDate, "name", Sort.Direction.ASC);
    }

    @Transactional(readOnly = true)
    @Override
    @PrivilegesRequired(values = Privileges.VIEW_ROLE, requireAll = true)
    public List<Role> searchRoles(String keyword, LocalDate fromDate, LocalDate toDate, String sortBy, Sort.Direction direction) {
        final String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim().toLowerCase();

        Specification<Role> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (kw != null) {
                String like = "%" + kw + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("code")), like),
                                cb.like(cb.lower(root.get("name")), like),
                                cb.like(cb.lower(root.get("description")), like),
                                cb.like(cb.lower(root.get("privileges")), like)
                        )
                );
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            query.distinct(true);
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort.Direction dir = (direction == null) ? Sort.Direction.ASC : direction;
        String field = (sortBy == null || sortBy.isBlank()) ? "name" : sortBy;
        return roleRepository.findAll(spec, Sort.by(dir, field));
    }

    @Transactional(readOnly = true)
    @Override
    @PrivilegesRequired(values = Privileges.VIEW_ROLE, requireAll = true)
    public List<Role> getActiveRoles() {
        return roleRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    @Override
    @PrivilegesRequired(values = Privileges.VIEW_ROLE, requireAll = true)
    public boolean isRoleCodeExists(String code) {
        return roleRepository.existsByCode(code);
    }

    @Transactional
    @Override
    @PrivilegesRequired(values = Privileges.CREATE_ROLE, requireAll = true)
    public RoleDTO createRole(Role role) {

        User actor = securityUtil.getCurrentUser();

        log.info("Role create called on role: {} at {}", role.getName(), LocalDateTime.now());
        String cleanName = role.getName()
                .trim()
                .replaceAll("\\s+", "_")
                .toUpperCase();
        role.setCode("ROLE_" + cleanName);
        if(isRoleCodeExists(role.getCode()))
        {
            throw new DuplicateRoleException("Role with name '" + role.getName() + "' already exists");
        }
        if(role.getPrivileges() == null || role.getPrivileges().isEmpty())
        {
            role.addPrivileges(Privileges.READ_ONLY);
        }

        auditPublisher.publish(AuditEvent.builder()
                .type("ROLE_CREATED")
                .userId(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                .target(role.getCode())
                .targetRole("none")
                .timestamp(OffsetDateTime.now())
                .details("Role '" + role.getName() + "' created with privileges: "
                        + role.getPrivileges().stream()
                        .map(Enum::name)
                        .collect(Collectors.joining(", ")))
                .build());

        return  mapper.toDto(roleRepository.save(role));
    }

    @Transactional
    @Override
    @PrivilegesRequired(values = Privileges.UPDATE_ROLE, requireAll = true)
    public RoleDTO updateRole(RoleUpdateRequestDto dto, String roleCode) {
        User actor = securityUtil.getCurrentUser();

        log.info("Role update called on role: {} at {}", dto.getName(), LocalDateTime.now());
        if(!isRoleCodeExists(roleCode))
        {
            throw new RoleNotFoundException("Role with code: '" + roleCode + " 'doesn't exists");
        }
        //Use mapper class for all update mapping with RoleRequestUpdateDto
        //Privileges is also mapped in mapper
        Role result = mapper.updateEntityFromDto(dto,this.returnByCode(roleCode));
        Role saved = roleRepository.save(result);

        auditPublisher.publish(AuditEvent.builder()
                .type("ROLE_UPDATED")
                .userId(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                .target(roleCode)
                .targetRole("none")
                .timestamp(OffsetDateTime.now())
                .details(roleCode + " updated with privileges: "
                        + result.getPrivileges().stream()
                        .map(Enum::name)
                        .collect(Collectors.joining(", ")))
                .build());
    return mapper.toDto(saved);
    }

    @Transactional
    @Override
    @PrivilegesRequired(values = Privileges.DELETE_ROLE, requireAll = true)
    public void DeleteRole(String roleCode) {
        User actor = securityUtil.getCurrentUser();
        log.info("Starting role deletion for {}", roleCode);
        if(!isRoleCodeExists(roleCode))
        {
            throw new RoleNotFoundException("Role with code: '" + roleCode + " 'doesn't exists");
        }
        if(!isRoleDeletable(roleCode))
        {
            throw new RoleIsFixedException("Role with code: '" + roleCode + " ' is not deletable");
        }
        log.info("Starting roleCode update from {} to {}", "ROLE_DEFAULT", roleCode);

        int updatedCount = userRepository.batchUpdateUser("ROLE_DEFAULT", roleCode);

        log.info("RoleCode update completed successfully. Total records updated: {}", updatedCount);

        entityManager.flush();
        entityManager.clear();
        roleRepository.delete(returnByCode(roleCode));

        auditPublisher.publish(AuditEvent.builder()
                .type("ROLE_DELETED")
                .userId(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                .target(roleCode)
                .targetRole("none")
                .timestamp(OffsetDateTime.now())
                .details("Role '" + roleCode + "' deleted. " +
                        updatedCount + " users reassigned to ROLE_DEFAULT.")
                .build());
    }

    @Override
    @PrivilegesRequired(values = Privileges.VIEW_OWN_ROLE, requireAll = true)
    public Role getUserRole(String code) {
        return roleRepository.findPrivilegesByCode(code);
    }

    private boolean isRoleDeletable(String roleCode)
    {
        return returnByCode(roleCode).isDeletable();
    }
    //Private helper class do not use outside of class.
    private Role returnByCode(String roleCode)
    {
        Optional<Role> found = roleRepository.findById(roleCode);
        return found.get();
    }

}
