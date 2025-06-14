package com.team.recommendation_gateway;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestTemplate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

/**
 * Alternative test implementation that avoids using @MockBean
 */
class RecommendationControllerUnitTest {

    private MockMvc mockMvc;
    
    @Mock
    private RestTemplate restTemplate;
    
    private RecommendationController recommendationController;
    
    @BeforeEach
    void setup() {
        // Initialize Mockito annotations
        MockitoAnnotations.openMocks(this);
        
        // Create controller with mocks
        recommendationController = new RecommendationController();
        
        // Set the mocked RestTemplate using reflection
        try {
            java.lang.reflect.Field restTemplateField = RecommendationController.class.getDeclaredField("restTemplate");
            restTemplateField.setAccessible(true);
            restTemplateField.set(recommendationController, restTemplate);
            
            java.lang.reflect.Field genaiApiUrlField = RecommendationController.class.getDeclaredField("genaiApiUrl");
            genaiApiUrlField.setAccessible(true);
            genaiApiUrlField.set(recommendationController, "http://localhost:8000/api/genai");
        } catch (Exception e) {
            throw new RuntimeException("Failed to set mock", e);
        }
        
        // Set up MockMVC
        mockMvc = MockMvcBuilders.standaloneSetup(recommendationController).build();
    }
    
    @Test
    void postRecommendation_shouldCallGenAI_andReturnResponse() throws Exception {
        // given
        String mockAnswer = "[{\"course\": \"IN9876\", \"reason\": \"Excellent for ML beginners.\"}]";
        ResponseEntity<String> aiResponse = new ResponseEntity<>(mockAnswer, HttpStatus.OK);
        Mockito.when(restTemplate.postForEntity(Mockito.anyString(), Mockito.any(), Mockito.eq(String.class)))
                .thenReturn(aiResponse);

        String jsonPayload = """
                    {
                        "credits": 10,
                        "categories": ["ML"],
                        "description": "data science"
                    }
                """;

        // when + then
        mockMvc.perform(post("/api/recommendation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("IN9876")));
    }
}
