package com.team.recommendation_gateway;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendation")
public class RecommendationController {

    @PostMapping
    public ResponseEntity<String> getRecommendation(@RequestBody Map<String, Object> payload) {
        // AI-Microservice Endpoint
        String aiUrl = "http://localhost:8000/frage";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        ResponseEntity<String> aiResponse = restTemplate.postForEntity(aiUrl, request, String.class);

        return ResponseEntity.status(aiResponse.getStatusCode()).body(aiResponse.getBody());
    }
}
