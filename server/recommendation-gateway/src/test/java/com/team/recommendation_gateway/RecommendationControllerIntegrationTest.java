package com.team.recommendation_gateway;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class RecommendationControllerIntegrationTest {
    private static MockWebServer mockWebServer;

    @Autowired
    private TestRestTemplate testRestTemplate;

    @BeforeAll
    static void setup() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start(8000); // Port muss mit dem in deinem Controller konfigurierten übereinstimmen
    }

    @AfterAll
    static void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void postRecommendation_returnsAIResponse() {
        // given
        String mockAIResponse = "[{\"course\": \"IN1234\", \"reason\": \"Matches your interest in AI.\"}]";
        mockWebServer.enqueue(new MockResponse()
                .setBody(mockAIResponse)
                .addHeader("Content-Type", "application/json"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> request = Map.of(
                "credits", 10,
                "categories", List.of("Machine Learning"),
                "description", "interested in AI and data science");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        // when
        ResponseEntity<String> response = testRestTemplate.postForEntity("/api/recommendation", entity, String.class);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("IN1234");
    }
}
