package com.team.review_service.config;

import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(EndpointRequest.toAnyEndpoint()).permitAll() // Allow actuator endpoints
                .requestMatchers("/actuator/**").permitAll() // Explicit actuator path
                .requestMatchers("/courses/**", "/reviews/**", "/students/**").permitAll()
                .anyRequest().permitAll()
            );
        
        return http.build();
    }
}
