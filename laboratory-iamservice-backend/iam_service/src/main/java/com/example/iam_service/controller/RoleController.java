package com.example.iam_service.controller;

import com.example.iam_service.dto.RoleDTO;
import com.example.iam_service.dto.request.RoleUpdateRequestDto;
import com.example.iam_service.exception.DuplicateRoleException;
import com.example.iam_service.exception.RoleDeletionException;
import com.example.iam_service.exception.RoleIsFixedException;
import com.example.iam_service.exception.RoleNotFoundException;
import com.example.iam_service.mapper.RoleMapper;
import com.example.iam_service.entity.Role;
import com.example.iam_service.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/roles")
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

    @Operation(summary = "Role creation API")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Role created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = RoleDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input - malformed JSON or validation error",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden. Unauthorized or the api is being called from an unregistered account.",
                    content = @Content),
            @ApiResponse(responseCode = "409", description = "Role already exists (duplicate)",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content)
    })
    @PostMapping
    public ResponseEntity<RoleDTO> createRole(@RequestBody @Validated RoleDTO dto)
    {
        log.info("Role creation started. At class:{}",this.getClass());
        try {
            RoleDTO roleResponseDTO = roleService.createRole(roleMapper.toEntity(dto));
            log.info("Role created Successfully. Class: {}",this.getClass());
            return ResponseEntity.status(HttpStatus.CREATED).body(roleResponseDTO);
        }catch (DuplicateRoleException e)
        {
            log.error("Duplicate role error: {} at {}", e.getMessage(),this.getClass());
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
    }

    @Operation(summary = "Update role by code")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Role updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = RoleDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input - roleCode is empty or DTO is null",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Role not found with given roleCode",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content)
    })
    @PutMapping("/update/{roleCode}")
    public ResponseEntity<RoleDTO>updateRole(@RequestBody @Validated RoleUpdateRequestDto dto, @PathVariable  String roleCode)
    {
        log.info("Role update started. At class:{}",this.getClass());
        if(roleCode.trim().isEmpty() || dto==null)
        {
            log.warn("Role update have bad request.. At class:{}",this.getClass());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        try{
            return  ResponseEntity.status(HttpStatus.ACCEPTED).body(roleService.updateRole(dto,roleCode));
        }
        catch (RoleNotFoundException e)
        {
            log.error("Role update started. At class:{}",this.getClass()+". But found no role with role code.");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Delete role by code")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Role deleted successfully",
                    content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid input - roleCode is empty or role is not deletable",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Role not found with given roleCode",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error - role deletion failed",
                    content = @Content)
    })
    @DeleteMapping("/delete/{roleCode}")
    public ResponseEntity deleteRole(@PathVariable String roleCode)
    {
        log.info("Role deletion started. At class:{}",this.getClass());
        if(roleCode.trim().isEmpty())
        {
            log.warn("Role delete have bad request.. At class:{}",this.getClass());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
         roleService.DeleteRole(roleCode);
        }
        catch (RoleNotFoundException e)
        {
            log.error("Role delete started. At class:{}",this.getClass()+". But found no role with role code.");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        catch (RoleDeletionException ex)
        {
            log.error("Role delete started. At class:{}",this.getClass()+". But failed.");
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        catch (RoleIsFixedException exception)
        {
            log.error("Role delete started. At class:{}",this.getClass()+". But Role is not deletable");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }
}
