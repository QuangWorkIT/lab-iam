package com.example.iam_service.util;

import com.example.iam_service.entity.Role;
import com.example.iam_service.entity.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Component
public class RoleSpecification {
    public static Specification<Role>isActive()
    {
        return ((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isActive"),true) );
    }
    public static Specification<Role>isInactive()
    {
        return ((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isActive"),false) );
    }
    public static Specification<Role>getByName(String name)
    {
        return ((root, query, criteriaBuilder) -> criteriaBuilder.like(root.get("name"),"%"+name.trim().toLowerCase()+"%") );
    }
    public static Specification<Role>getByCode(String code)
    {
       String formattedCode ="ROLE_" + code.toUpperCase().replace(" ", "_");
        return ((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("code"),formattedCode));
    }


  }



