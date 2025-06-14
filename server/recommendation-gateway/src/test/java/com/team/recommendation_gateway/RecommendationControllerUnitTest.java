package com.team.recommendation_gateway;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

@WebMvcTest(RecommendationController.class)
class RecommendationControllerUnitTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RestTemplate restTemplate;

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
