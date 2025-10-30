package com.example.iam_service.serviceImpl;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.Role;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.exception.RoleNotFoundException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.repository.RoleRepository;
import com.example.iam_service.service.RoleService;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class RoleServiceImp implements RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleMapper mapper;

    @Transactional(readOnly = true)
    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Override
    public Page<Role> getRolesPaged(Pageable pageable) {
        return roleRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Override
    public Optional<Role> getRoleByCode(String code) {
        return roleRepository.findById(code);
    }

    @Transactional(readOnly = true)
    @Override
    public List<Role> searchRolesByName(String name) {
        return roleRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    @Override
    public List<Role> searchRoles(String keyword, LocalDate fromDate, LocalDate toDate) {
        return searchRoles(keyword, fromDate, toDate, "name", Sort.Direction.ASC);
    }

    @Transactional(readOnly = true)
    @Override
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
    public List<Role> getActiveRoles() {
        return roleRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    @Override
    public boolean isRoleCodeExists(String code) {
        return roleRepository.existsByCode(code);
    }

    @Transactional
    @Override
    public RoleDTO createRole(Role role) {

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
        log.info("Role creation successful on role: {} at {}", role.getName(), LocalDateTime.now());
        return  mapper.toDto(roleRepository.save(role));
    }

    @Override
    public RoleDTO updateRole(RoleUpdateRequestDto dto, String roleCode) {
        log.info("Role update called on role: {} at {}", dto.getName(), LocalDateTime.now());
        if(!isRoleCodeExists(roleCode))
        {
            throw new RoleNotFoundException("Role with code: '" + roleCode + " 'doesn't exists");
        }
        //Use mapper class for all update mapping with RoleRequestUpdateDto
        //Privileges is also mapped in mapper
   Role result = mapper.updateEntityFromDto(dto,this.returnByCode(roleCode));
        log.info("Role update successful on role: {} at {}", dto.getName(), LocalDateTime.now());
    return mapper.toDto(roleRepository.save(result));
    }

    @Override
    public void DeleteRole(String roleCode) {

    }


    //Private helper class do not use outside of class.
    private Role returnByCode(String roleCode)
    {
        Optional<Role> found = roleRepository.findById(roleCode);
        return found.get();
    }
}
