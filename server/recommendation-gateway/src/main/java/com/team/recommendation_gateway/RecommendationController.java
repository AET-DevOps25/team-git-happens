package com.team.recommendation_gateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/recommendation")
public class RecommendationController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${genai.api.url}")
    private String genaiApiUrl;

    @PostMapping
    public ResponseEntity<String> getRecommendation(@RequestBody Map<String, Object> payload) {
        Integer credits = payload.get("credits") instanceof Integer ? (Integer) payload.get("credits") : 0;
                List<String> categories = new ArrayList<>();
        if (payload.get("categories") instanceof List<?>) {
            List<?> rawList = (List<?>) payload.get("categories");
            for (Object item : rawList) {
                if (item instanceof String) {
                    categories.add((String) item);
                }
            }
        }
        
        String description = payload.get("description") instanceof String ? (String) payload.get("description") : "";

        String prompt = String.format(
                "A user wants course recommendations with the following criteria:\n" +
                        "- Total number of credits they want to take: %d (with a tolerance of ±2 credit)\n" +
                        "- Categories: %s\n" +
                        "- Description: %s\n" +
                        "Please recommend a list of suitable courses from the curriculum that together add up to approximately the total credits mentioned (with a ±1 credit tolerance) and answewr in english. "
                        +
                        "For each course, include the course id and a reason why you recommend it. Return the list in JSON format like [{\"course\": \"IN25173\", \"reason\": \"...\"}, {\"course\": \"IN1234\", \"reason\": \"...\"}].",
                credits, categories, description);

        Map<String, String> aiPayload = Map.of("question", prompt);

        String aiUrl = genaiApiUrl + "/question";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(aiPayload, headers);

        ResponseEntity<String> aiResponse = restTemplate.postForEntity(aiUrl, request, String.class);

        return ResponseEntity.status(aiResponse.getStatusCode()).body(aiResponse.getBody());
    }
}
