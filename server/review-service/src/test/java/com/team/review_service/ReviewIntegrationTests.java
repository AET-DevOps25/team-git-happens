package com.team.review_service;

import com.fasterxml.jackson.databind.ObjectMapper; 
import com.team.review_service.dto.ReviewDTO; 
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType; 
import org.springframework.test.web.servlet.MockMvc; 
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get; 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*; 

@SpringBootTest
@AutoConfigureMockMvc 
@Transactional
class ReviewIntegrationTests {

    @Autowired
    private MockMvc mockMvc; 

    @Autowired
    private ObjectMapper objectMapper; 


    @Test
    void shouldCreateAndRetrieveReviewViaHttp() throws Exception {
        
        ReviewDTO reviewToCreate = new ReviewDTO();
        reviewToCreate.setStudentMatrNr("12345678");
        reviewToCreate.setCourseId("IN2000");
        reviewToCreate.setRating((byte) 5); 
        reviewToCreate.setReviewText("Excellent course, highly recommended!");

        MvcResult postResult = mockMvc.perform(post("/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewToCreate)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reviewId").exists())
                .andExpect(jsonPath("$.studentMatrNr").value("12345678"))
                .andExpect(jsonPath("$.courseId").value("IN2000"))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.reviewText").value("Excellent course, highly recommended!"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andReturn();
        
        String responseString = postResult.getResponse().getContentAsString();
        ReviewDTO createdReviewResponse = objectMapper.readValue(responseString, ReviewDTO.class);
        Integer createdReviewId = createdReviewResponse.getReviewId();
        assertThat(createdReviewId).isNotNull();

        mockMvc.perform(get("/reviews/" + createdReviewId)) 
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.reviewId").value(createdReviewId))
                .andExpect(jsonPath("$.studentMatrNr").value("12345678"))
                .andExpect(jsonPath("$.courseId").value("IN2000"))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.reviewText").value("Excellent course, highly recommended!"))
                .andExpect(jsonPath("$.createdAt").exists()); 
                
    }
}
