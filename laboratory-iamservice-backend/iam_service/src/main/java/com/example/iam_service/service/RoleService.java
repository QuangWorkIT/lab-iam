package com.example.iam_service.service;

import com.example.iam_service.entity.Role;
import com.example.iam_service.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDate;
import java.util.Optional;
import java.util.ArrayList;
import jakarta.persistence.criteria.Predicate;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Role> getRolesPaged(Pageable pageable) {
        return roleRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Role> getRoleByCode(String code) {
        return roleRepository.findById(code);
    }

    @Transactional(readOnly = true)
    public List<Role> searchRolesByName(String name) {
        return roleRepository.findByNameContainingIgnoreCase(name);
    }

    // Tìm kiếm tổng hợp theo nhiều trường và theo khoảng ngày (Specification để tránh lỗi type null)
    @Transactional(readOnly = true)
    public List<Role> searchRoles(String keyword, LocalDate fromDate, LocalDate toDate) {
        // Giữ hành vi cũ: mặc định sort theo name asc
        return searchRoles(keyword, fromDate, toDate, "name", Sort.Direction.ASC);
    }

    // Overload: cho phép truyền sortBy/direction khi cần
    @Transactional(readOnly = true)
    public List<Role> searchRoles(String keyword, LocalDate fromDate, LocalDate toDate,
                                  String sortBy, Sort.Direction direction) {
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
    public List<Role> getActiveRoles() {
        return roleRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public boolean isRoleCodeExists(String code) {
        return roleRepository.existsByCode(code);
    }
}
