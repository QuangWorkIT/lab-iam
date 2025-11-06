package com.example.iam_service.audit;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;

@Configuration
@AllArgsConstructor
public class AuditConfig {
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Bean
    @Profile("!kafka") // default: no kafka
    public AuditPublisher logPublisher() {
        return new LogAuditPublisher(kafkaTemplate);
    }

//    @Bean
//    @Profile("kafka") // active only when spring.profiles.active=kafka
//    public AuditPublisher kafkaPublisher(KafkaTemplate<String, AuditEvent> kafkaTemplate) {
//        return new KafkaAuditPublisher(kafkaTemplate);
//    }
}
