package com.example.iam_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);       // minimum active threads
        executor.setMaxPoolSize(10);       // maximum threads allowed
        executor.setQueueCapacity(100);    // queue before rejecting new tasks
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}
