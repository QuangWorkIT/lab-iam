package com.example.iam_service.util;

import com.example.iam_service.entity.Role;
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

  public static Specification<Role> SearchRole(String keyword, LocalDate fromDate, LocalDate toDate)
  {
      return (root, query, cb) -> {
          List<Predicate> predicates = new ArrayList<>();

          // Keyword search across multiple fields (OR condition)
          if (keyword != null && !keyword.trim().isEmpty()) {
              String searchPattern = "%" + keyword.trim().toLowerCase() + "%";

              Predicate keywordPredicate = cb.or(
                      cb.like(cb.lower(root.get("code")), searchPattern),
                      cb.like(cb.lower(root.get("name")), searchPattern),
                      cb.like(cb.lower(root.get("description")), searchPattern)
              );

              predicates.add(keywordPredicate);
          }

          // Date range filters (AND conditions)
          if (fromDate != null) {
              predicates.add(
                      cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate)
              );
          }

          if (toDate != null) {
              predicates.add(
                      cb.lessThanOrEqualTo(root.get("createdAt"), toDate)
              );
          }

          // Remove duplicate results
          query.distinct(true);

          // Combine all predicates with AND
          return predicates.isEmpty() ?
                  cb.conjunction() :
                  cb.and(predicates.toArray(new Predicate[0]));
      };
  }


}
