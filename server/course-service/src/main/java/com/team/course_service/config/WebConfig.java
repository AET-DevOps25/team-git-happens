package com.team.course_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        logger.info("corsConfigurer bean is being created. CORS configuration will be applied.");
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                logger.info("Applying CORS mappings. Allowed origin: http://localhost:3000 for /**");
                registry.addMapping("/**") // Allow CORS for all paths
                        .allowedOrigins("http://localhost:3000") // Allow your frontend origin
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                        .allowedHeaders("*") // Allow all headers
                        .allowCredentials(true); // Allow credentials
            }
        };
    }
}
