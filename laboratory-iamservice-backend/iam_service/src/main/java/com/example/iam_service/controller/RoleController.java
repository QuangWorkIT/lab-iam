package com.example.iam_service.controller;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.entity.Role;
import com.example.iam_service.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper roleMapper;

    // Get all roles
    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        List<RoleDTO> roleDTOs = roles.stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDTOs);
    }

    // Get roles with pagination
    @GetMapping("/paged")
    public ResponseEntity<Map<String, Object>> getRolesPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "code") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Role> rolePage = roleService.getRolesPaged(pageable);

        List<RoleDTO> roleList = rolePage.getContent().stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("roles", roleList);
        response.put("currentPage", rolePage.getNumber());
        response.put("totalItems", rolePage.getTotalElements());
        response.put("totalPages", rolePage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    // Get role by code
    @GetMapping("/{code}")
    public ResponseEntity<RoleDTO> getRoleByCode(@PathVariable String code) {
        return roleService.getRoleByCode(code)
                .map(roleMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

        // Search roles (combined fields) and optional date range
    @GetMapping("/search")
    public ResponseEntity<List<RoleDTO>> searchRoles(
            @RequestParam(name = "q", required = false) String q,
            // Backward compatibility: support old 'name' param
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "fromDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "direction", required = false) String direction
    ) {
        String keyword = (q != null && !q.isBlank()) ? q : name;
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        List<Role> roles = roleService.searchRoles(keyword, fromDate, toDate, sortBy, dir);
        List<RoleDTO> roleDTOs = roles.stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDTOs);
    }

    // Get only active roles
    @GetMapping("/active")
    public ResponseEntity<List<RoleDTO>> getActiveRoles() {
        List<Role> roles = roleService.getActiveRoles();
        List<RoleDTO> roleDTOs = roles.stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDTOs);
    }
}
