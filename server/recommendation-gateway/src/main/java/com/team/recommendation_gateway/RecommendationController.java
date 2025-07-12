package com.team.recommendation_gateway;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Recommendation Gateway", description = "Course recommendation service that integrates with GenAI to provide personalized course suggestions")
public class RecommendationController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${genai.api.url}")
    private String genaiApiUrl;

    @GetMapping("/test")
    @Operation(summary = "Test CORS configuration", description = "Simple endpoint to test if CORS is working properly")
    @ApiResponse(responseCode = "200", description = "CORS test successful")
    public ResponseEntity<String> testCors() {
        return ResponseEntity.ok("CORS test successful");
    }

    @PostMapping
    @Operation(summary = "Get course recommendations", description = "Get AI-powered course recommendations based on credits, categories, and description")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recommendations generated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getRecommendation(
        @Parameter(description = "Request payload containing credits, categories, and description") 
        @RequestBody Map<String, Object> payload) {
        System.out.println("=== NEW REQUEST RECEIVED ===");
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
                "CRITICAL INSTRUCTION: YOU MUST RESPOND EXCLUSIVELY IN ENGLISH. DO NOT USE GERMAN, SPANISH, FRENCH, OR ANY OTHER LANGUAGE. EVERY WORD MUST BE IN ENGLISH.\n\n" +
                        "RESPOND IN ENGLISH ONLY. ENGLISH LANGUAGE REQUIRED.\n\n" +
                        "A user wants course recommendations with the following criteria:\n" +
                        "- Total number of credits they want to take: %d (if 0, ignore credit constraints and recommend based on content)\n" +
                        "- Categories: %s\n" +
                        "- Description: %s\n\n" +
                        "Please query the available courses from the database and recommend suitable courses based on the criteria above. If credits is 0, recommend courses that match the categories and description. " +
                        "For each course, include the EXACT course title from the database in the 'course' field and a reason why you recommend it. " +
                        "Return the list in JSON format like [{\"course\": \"Advanced Natural Language Processing\", \"reason\": \"This course covers...\"}, {\"course\": \"Query Optimization\", \"reason\": \"This course teaches...\"}]. " +
                        "MANDATORY: All text, explanations, and reasons MUST be written in English language only. NO GERMAN ALLOWED.",
                credits, categories, description);

        Map<String, String> aiPayload = Map.of("question", prompt);

        String aiUrl = genaiApiUrl + "/question";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(aiPayload, headers);

        try {
            ResponseEntity<String> aiResponse = restTemplate.postForEntity(aiUrl, request, String.class);
            String responseBody = aiResponse.getBody();
            
            // Check if the response contains German text and translate it to English
            if (responseBody != null && containsGermanText(responseBody)) {
                System.out.println("Detected German response from AI, attempting translation");
                String translatedResponse = translateGermanToEnglish(responseBody);
                if (translatedResponse != null) {
                    System.out.println("Successfully translated German response to English");
                    return ResponseEntity.ok(translatedResponse);
                } else {
                    System.out.println("Translation failed, using fallback instead");
                    String fallbackRecommendations = generateFallbackRecommendation(credits, categories, description);
                    String fallbackResponse = "{\"answer\": \"" + fallbackRecommendations.replace("\"", "\\\"") + "\"}";
                    return ResponseEntity.ok(fallbackResponse);
                }
            }
            
            return ResponseEntity.status(aiResponse.getStatusCode()).body(responseBody);
        } catch (Exception e) {
            // Fallback response when GenAI service is unavailable
            String fallbackRecommendations = generateFallbackRecommendation(credits, categories, description);
            // Wrap the recommendations in the same format as the GenAI service
            String fallbackResponse = "{\"answer\": \"" + fallbackRecommendations.replace("\"", "\\\"") + "\"}";
            return ResponseEntity.ok(fallbackResponse);
        }
    }

    private String generateFallbackRecommendation(Integer credits, List<String> categories, String description) {
        // Generate a simple fallback recommendation based on the request
        System.out.println("Fallback recommendation - Credits: " + credits + ", Categories: " + categories + ", Description: " + description);
        
        StringBuilder fallback = new StringBuilder();
        fallback.append("[");
        
        if (categories.contains("Databases and Information Systems") || description.toLowerCase().contains("query") || description.toLowerCase().contains("database")) {
            System.out.println("Matched database category or keywords");
            fallback.append("{\"course\": \"Query Optimization\", \"reason\": \"This course directly covers query optimization techniques which matches your description.\"},");
            fallback.append("{\"course\": \"Application and Implementation of Database Systems\", \"reason\": \"Comprehensive course covering database system implementation and optimization.\"}");
        } else if (categories.contains("Machine Learning and Analytics") || description.toLowerCase().contains("ai") || description.toLowerCase().contains("machine learning")) {
            System.out.println("Matched ML category or keywords");
            fallback.append("{\"course\": \"Advanced Natural Language Processing\", \"reason\": \"This course covers advanced AI concepts and is highly relevant for machine learning and analytics.\"},");
            fallback.append("{\"course\": \"Artificial Intelligence in Medicine\", \"reason\": \"Provides practical applications of AI techniques in real-world scenarios.\"}");
        } else if (categories.contains("Computer Graphics and Vision")) {
            System.out.println("Matched Computer Graphics category");
            fallback.append("{\"course\": \"Computer Vision III: Detection, Segmentation, and Tracking\", \"reason\": \"Advanced computer vision techniques for complex visual tasks.\"},");
            fallback.append("{\"course\": \"Advanced Deep Learning for Computer Vision: Visual Computing\", \"reason\": \"Deep learning applications in visual computing and image analysis.\"}");
        } else if (categories.contains("Algorithms")) {
            System.out.println("Matched Algorithms category");
            fallback.append("{\"course\": \"Selected Topics in Algorithms\", \"reason\": \"Advanced algorithmic concepts and design patterns.\"},");
            fallback.append("{\"course\": \"Approximation Algorithms\", \"reason\": \"Techniques for solving complex optimization problems efficiently.\"}");
        } else {
            // Default recommendations
            System.out.println("Using default recommendations");
            fallback.append("{\"course\": \"Advanced Natural Language Processing\", \"reason\": \"Popular course covering modern AI and language processing techniques.\"},");
            fallback.append("{\"course\": \"Cloud Information Systems\", \"reason\": \"Essential skills for modern software development and system design.\"}");
        }
        
        fallback.append("]");
        return fallback.toString();
    }

    private boolean containsGermanText(String text) {
        // Check for distinctly German words and phrases that are unlikely to appear in English
        String[] germanIndicators = {
            "Da der", "Der Benutzer", "Die Anforderungen", "Das Kriterium",
            " der Benutzer", " die Kurse", " das Thema", " das ist",
            " der Kurs", " die Kategorie", " des Benutzers",
            "jedoch", "allerdings", "empfehle", "würde", "könnte", 
            "sollte", "möchte", "kann ich", "Benutzer", "Anforderungen", 
            "verfügbaren", "basierend", "Berücksichtigung", "Einschränkung", 
            "Empfehlung", "aussprechen", "entspricht", "Leider", "fehlen", 
            "Informationen", "genaue", "spezifischen", "bereitgestellten", 
            "Daten", "wichtig", "beachten", "konkrete", "exakte", "sowohl", 
            "Kriterium", "Themenbereiche", "erfüllt", "schwierig", "scheint",
            "bedeutet dies", "keine Kurse", "einen Kurs", "einem Kurs",
            "dieser Kurs", "diese Kurse", "dieses Thema", "welche Kurse",
            "welcher Kurs", "welches Thema", "Credits", "Punkte", "Toleranz",
            "Credit-", "auch wenn", "Es ist", "Es gibt", "ohne", "mit einer"
        };
        
        String lowerText = text.toLowerCase();
        System.out.println("Checking text for German: " + text.substring(0, Math.min(200, text.length())) + "...");
        
        int germanWordCount = 0;
        for (String indicator : germanIndicators) {
            if (lowerText.contains(indicator.toLowerCase())) {
                germanWordCount++;
                System.out.println("German indicator found: " + indicator);
            }
        }
        
        // Require at least 3 German indicators to confirm it's German (stricter threshold)
        boolean isGerman = germanWordCount >= 3;
        System.out.println("German word count: " + germanWordCount + ", Is German: " + isGerman);
        return isGerman;
    }

    private String translateGermanToEnglish(String germanText) {
        try {
            System.out.println("Attempting to translate German text to English...");
            
            // Create a translation prompt
            String translationPrompt = String.format(
                "TRANSLATE THE FOLLOWING GERMAN TEXT TO ENGLISH. " +
                "PRESERVE THE EXACT JSON STRUCTURE AND FORMAT. " +
                "ONLY TRANSLATE THE TEXT CONTENT, NOT THE JSON KEYS OR STRUCTURE. " +
                "ENSURE THE OUTPUT IS VALID JSON WITH THE SAME FORMAT AS THE INPUT:\n\n" +
                "%s", germanText);
            
            Map<String, String> translationPayload = Map.of("question", translationPrompt);
            
            String aiUrl = genaiApiUrl + "/question";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> translationRequest = new HttpEntity<>(translationPayload, headers);
            
            // Set a shorter timeout for translation to avoid long waits
            ResponseEntity<String> translationResponse = restTemplate.postForEntity(aiUrl, translationRequest, String.class);
            
            String translatedText = translationResponse.getBody();
            
            // Verify the translation doesn't still contain German
            if (translatedText != null && !containsGermanText(translatedText)) {
                System.out.println("Translation successful, no German text detected in result");
                return translatedText;
            } else {
                System.out.println("Translation still contains German text or failed");
                return null;
            }
            
        } catch (Exception e) {
            System.out.println("Translation failed with exception: " + e.getMessage());
            return null;
        }
    }
}
