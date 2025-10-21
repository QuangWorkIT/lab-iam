package com.example.iam_service.audit;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class AuditConfig {

    @Bean
    @Profile("!kafka") // default: no kafka
    public AuditPublisher logPublisher() {
        return new LogAuditPublisher();
    }

//    @Bean
//    @Profile("kafka") // active only when spring.profiles.active=kafka
//    public AuditPublisher kafkaPublisher(KafkaTemplate<String, AuditEvent> kafkaTemplate) {
//        return new KafkaAuditPublisher(kafkaTemplate);
//    }
}
