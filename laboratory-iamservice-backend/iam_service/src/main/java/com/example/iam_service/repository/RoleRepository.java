package com.example.iam_service.repository;

import com.example.iam_service.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, String>, JpaSpecificationExecutor<Role> {
    // String là kiểu dữ liệu của primary key (code)

    // Tìm theo tên (có thể sử dụng cho tính năng tìm kiếm)
    List<Role> findByNameContainingIgnoreCase(String name);

    // Tìm các role đang active
    List<Role> findByIsActiveTrue();

    // Kiểm tra role code đã tồn tại chưa
    boolean existsByCode(String code);

    // fetch privileges
    Role findPrivilegesByCode(String roleCode);
}
