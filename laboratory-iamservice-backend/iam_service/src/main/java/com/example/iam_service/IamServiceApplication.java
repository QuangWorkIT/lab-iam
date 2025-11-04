package com.example.iam_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableDiscoveryClient
@EnableCaching
@EnableScheduling
public class IamServiceApplication {

	public static void main(String[] args) {
		System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
		SpringApplication.run(IamServiceApplication.class, args);
	}

}
