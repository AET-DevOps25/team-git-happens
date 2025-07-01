package com.team.authentication_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class WebConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        logger.info("Registering CORS allowed origins");
        registry.addMapping("/**")
            .allowedOriginPatterns(
                "http://localhost:3000",
                "http://client-app.student.k8s.aet.cit.tum.de",
                "http://k83-client-app.student.k8s.aet.cit.tum.de"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Authorization", "Content-Type")
            .allowCredentials(true);
    }
}
