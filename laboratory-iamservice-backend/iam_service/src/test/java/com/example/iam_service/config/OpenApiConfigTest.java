package com.example.iam_service.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class OpenApiConfigTest {
    private OpenApiConfig openApiConfig;

    @BeforeEach
    void setUp() {
        openApiConfig = new OpenApiConfig();
    }

    @Test
    void testCustomOpenAPI_NotNull() {
        // Act
        OpenAPI openAPI = openApiConfig.customOpenAPI();

        // Assert
        assertNotNull(openAPI, "OpenAPI bean should not be null");
    }

    @Test
    void testServerConfiguration() {
        // Act
        OpenAPI openAPI = openApiConfig.customOpenAPI();
        List<Server> servers = openAPI.getServers();

        // Assert
        assertNotNull(servers, "Servers list should not be null");
        assertEquals(1, servers.size(), "There should be exactly one server");

        Server server = servers.get(0);
        assertEquals("https://iam-service.site/api", server.getUrl());
        assertEquals("Production Server", server.getDescription());
    }

    @Test
    void testApiInfo() {
        // Act
        OpenAPI openAPI = openApiConfig.customOpenAPI();
        Info info = openAPI.getInfo();

        // Assert
        assertNotNull(info, "Info section must not be null");
        assertEquals("IAM Service API", info.getTitle());
        assertEquals("API documentation for the Laboratory IAM Service backend", info.getDescription());
        assertEquals("1.0.0", info.getVersion());
    }

    @Test
    void testSecurityRequirement() {
        // Act
        OpenAPI openAPI = openApiConfig.customOpenAPI();
        List<SecurityRequirement> securityRequirements = openAPI.getSecurity();

        // Assert
        assertNotNull(securityRequirements, "Security requirements must not be null");
        assertFalse(securityRequirements.isEmpty(), "There must be a security requirement");

        SecurityRequirement securityRequirement = securityRequirements.get(0);

        assertTrue(
                securityRequirement.containsKey("bearerAuth"),
                "Security requirement must contain 'bearerAuth'"
        );
    }

    @Test
    void testSecurityScheme() {
        // Act
        OpenAPI openAPI = openApiConfig.customOpenAPI();
        SecurityScheme scheme = openAPI.getComponents().getSecuritySchemes().get("bearerAuth");

        // Assert
        assertNotNull(scheme, "Security scheme 'bearerAuth' must not be null");

        assertEquals(SecurityScheme.Type.HTTP, scheme.getType());
        assertEquals("bearer", scheme.getScheme());
        assertEquals("JWT", scheme.getBearerFormat());
    }
}
