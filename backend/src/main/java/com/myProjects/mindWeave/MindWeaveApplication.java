package com.myProjects.mindWeave;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = "com.myProjects.mindWeave")
@EnableJpaRepositories(basePackages = "com.myProjects.mindWeave")
public class MindWeaveApplication {

    public static void main(String[] args) {
        SpringApplication.run(MindWeaveApplication.class, args);
    }
}