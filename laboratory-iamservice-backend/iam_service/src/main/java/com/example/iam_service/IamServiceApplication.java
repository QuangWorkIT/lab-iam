package com.example.iam_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.RestController;


@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class IamServiceApplication {

	public static void main(String[] args) {
		System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
		SpringApplication.run(IamServiceApplication.class, args);
		System.out.println("Timezone set to: " + java.util.TimeZone.getDefault().getID());
		System.out.println("ENCRYPTION KEY (exists?): " + (System.getenv("APP_ENCRYPTION_KEY") != null));

	}

}
