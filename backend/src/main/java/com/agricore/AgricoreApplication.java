package com.agricore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AgricoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgricoreApplication.class, args);
        System.out.println("✅ AgriCore Backend running on http://localhost:8080");
    }
}