package com.team.recommendation_gateway;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/recommendation")
public class RecommendationController {

    @PostMapping
    public ResponseEntity<String> getRecommendation(@RequestBody Map<String, Object> payload) {
        Integer credits = (Integer) payload.get("credits");
        List<String> categories = (List<String>) payload.get("categories");
        String description = (String) payload.get("description");

        String prompt = String.format(
                "A user wants course recommendations with the following criteria:\n" +
                        "- Total number of credits they want to take: %d (with a tolerance of ±2 credit)\n" +
                        "- Categories: %s\n" +
                        "- Description: %s\n" +
                        "Please recommend a list of suitable courses from the curriculum that together add up to approximately the total credits mentioned (with a ±1 credit tolerance). "
                        +
                        "For each course, include the course id and a reason why you recommend it. Return the list in JSON format like [{\"course\": \"IN25173\", \"reason\": \"...\"}, {\"course\": \"IN1234\", \"reason\": \"...\"}].",
                credits, categories, description);

        Map<String, String> aiPayload = Map.of("question", prompt);

        String aiUrl = "http://genai_app:8000/question";
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(aiPayload, headers);

        ResponseEntity<String> aiResponse = restTemplate.postForEntity(aiUrl, request, String.class);

        return ResponseEntity.status(aiResponse.getStatusCode()).body(aiResponse.getBody());
    }
}
