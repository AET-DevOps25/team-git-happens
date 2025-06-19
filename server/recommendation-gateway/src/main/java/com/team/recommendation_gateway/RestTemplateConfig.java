package com.team.recommendation_gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // Setting reasonable timeouts to avoid hanging requests
        restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory());
        ((org.springframework.http.client.SimpleClientHttpRequestFactory) restTemplate.getRequestFactory())
                .setConnectTimeout(10000); // 10 seconds
        ((org.springframework.http.client.SimpleClientHttpRequestFactory) restTemplate.getRequestFactory())
                .setReadTimeout(30000); // 30 seconds
        return restTemplate;
    }
}
