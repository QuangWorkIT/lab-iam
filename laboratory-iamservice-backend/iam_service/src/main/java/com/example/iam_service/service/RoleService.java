package com.example.iam_service.service;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public interface RoleService {
    public List<Role> getAllRoles();
    public Page<Role> getRolesPaged(Pageable pageable);
    public Optional<Role> getRoleByCode(String code);
    public List<Role> searchRolesByName(String name);
    public List<Role> searchRoles(String keyword, LocalDate fromDate, LocalDate toDate);
    public List<Role> searchRoles(String keyword, LocalDate fromDate, LocalDate toDate, String sortBy, Sort.Direction direction);
    public List<Role> getActiveRoles();
    public boolean isRoleCodeExists(String code);
    public RoleDTO createRole(Role role);
    public RoleDTO updateRole(RoleUpdateRequestDto dto, String roleCode);
    public void DeleteRole( String roleCode);
}
