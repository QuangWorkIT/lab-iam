package com.example.iam_service.util;

import com.example.iam_service.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {
    public static Specification<User> getByRole(String roleCode)
    {
        return ((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("roleCode"),roleCode));
    }
}
