	package com.example.iam_service;

	import org.springframework.boot.SpringApplication;
	import org.springframework.boot.autoconfigure.SpringBootApplication;
	import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
	import org.springframework.web.bind.annotation.RestController;


	@SpringBootApplication
	@EnableDiscoveryClient
	@RestController
	public class IamServiceApplication {
		public static void main(String[] args) {
			System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
			System.out.println("Current JVM TimeZone: " + java.util.TimeZone.getDefault().getID());
			SpringApplication.run(IamServiceApplication.class, args);

		}

	}
