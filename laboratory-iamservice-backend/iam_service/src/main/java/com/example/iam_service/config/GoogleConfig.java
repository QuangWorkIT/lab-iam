package com.example.iam_service.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class GoogleConfig {

    @Bean
    public NetHttpTransport transport() {
        return new NetHttpTransport();
    }

    @Bean
    public GsonFactory gsonFactory() {
        return new GsonFactory();
    }

    @Bean
    public GoogleIdTokenVerifier verifier(
            @Value("${google.web-client-id}") String clientId,
            NetHttpTransport transport,
            GsonFactory jsonFactory
    ) {
        return new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList(clientId))
                .build();
    }
}
