package com.example.iam_service.security;

import com.example.iam_service.entity.Enum.Privileges;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface PrivilegesRequired {
    Privileges[]values();
    boolean requireAll();
    String message() default "Insufficient privileges";
}
