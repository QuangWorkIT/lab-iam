package com.example.api_gateway;

import io.jsonwebtoken.Claims;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.apache.http.HttpHeaders;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthentication implements WebFilter {
    private final JwtUtil jwtUtil;

    public Mono<Void> filter(@NonNull ServerWebExchange exchange, @NonNull WebFilterChain chain) {
        String path =  exchange.getRequest().getPath().value();
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        System.out.println("request path " + path);
        if(path.startsWith("/iam/api/auth") || authHeader == null || !authHeader.startsWith("Bearer ")) {
            return chain.filter(exchange);
        }

        try {
            String token = authHeader.substring(7);
            Claims claim = jwtUtil.validate(token);

            String userId = claim.getSubject();
            String role = claim.get("role", String.class);

            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority(role));

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null , authorities);

            // modify request headers
            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r.headers(h -> {
                        h.add("X-User-Id", userId);
                        h.add("X-User-Role", role);
                        h.add("X-Auth-Token", token);
                    }))
                    .build();
            System.out.println("JWT valid");
            return chain.filter(mutatedExchange)
                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
        } catch (JwtException e) {
            System.out.println("JWT not valid");
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);

            // manually config CORS
            response.getHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
            response.getHeaders().add("Access-Control-Allow-Credentials", "true");
            response.getHeaders().add("Access-Control-Allow-Headers", "*");
            response.getHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.getHeaders().add("Content-Type", "application/json");

            String body = "{\"error\": \"" + "JWT invalid or expired" + "\"}";
            DataBuffer buffer = response
                    .bufferFactory()
                    .wrap(body.getBytes(StandardCharsets.UTF_8));

            return response.writeWith(Mono.just(buffer));
        }
    }
}
