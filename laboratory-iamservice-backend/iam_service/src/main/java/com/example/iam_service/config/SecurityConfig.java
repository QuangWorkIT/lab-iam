package com.example.iam_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .csrf(csrf -> csrf.disable())
                .httpBasic(Customizer -> Customizer.disable()) // 👈 rename variable to avoid conflict
                .formLogin(Customizer -> Customizer.disable())
                .logout(Customizer -> Customizer.disable())
                .exceptionHandling(ex -> ex
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(403);
                            res.getWriter().write("Access Denied: " + e.getMessage());
                        })
                );

        return http.build();
    }

//    @Bean
//    public InMemoryUserDetailsManager userDetailsService() {
//        return new InMemoryUserDetailsManager();
//    }
}
