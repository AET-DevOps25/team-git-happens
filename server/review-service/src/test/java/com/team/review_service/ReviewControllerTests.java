package com.team.review_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team.review_service.controller.ReviewController;
import com.team.review_service.dto.ReviewDTO;
import com.team.review_service.mapper.ReviewMapper;
import com.team.review_service.model.Review;
import com.team.review_service.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ReviewController.class)
public class ReviewControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReviewService reviewService; 

    @Autowired
    private ObjectMapper objectMapper;

    private ReviewDTO reviewDTO1;
    private Review review1;

    @TestConfiguration
    static class ControllerTestConfig {
        @Bean
        public ReviewService reviewService() {
            return Mockito.mock(ReviewService.class);
        }
    }

    @BeforeEach
    void setUp() {
        reviewDTO1 = new ReviewDTO(1, "IN2000", "01234567", (byte) 4, "Great course!", LocalDateTime.now());
        review1 = ReviewMapper.toEntity(reviewDTO1); 
    }

    @Test
    void createReview_whenValidInput_shouldReturnCreatedReview() throws Exception {
        given(reviewService.create(any(Review.class))).willReturn(Optional.of(review1));

        mockMvc.perform(post("/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewDTO1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reviewId").value(reviewDTO1.getReviewId()))
                .andExpect(jsonPath("$.studentMatrNr").value(reviewDTO1.getStudentMatrNr()));
    }

    @Test
    void createReview_whenServiceReturnsEmpty_shouldReturnBadRequest() throws Exception {
        given(reviewService.create(any(Review.class))).willReturn(Optional.empty());

        mockMvc.perform(post("/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewDTO1)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getReviewById_whenReviewExists() throws Exception {
        given(reviewService.getReviewById(1)).willReturn(Optional.of(review1));

        mockMvc.perform(get("/reviews/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewId").value(reviewDTO1.getReviewId()));
    }

    @Test
    void getReviewById_whenReviewDoesNotExist() throws Exception {
        given(reviewService.getReviewById(anyInt())).willReturn(Optional.empty());

        mockMvc.perform(get("/reviews/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getReviewsByCourseId() throws Exception {
        given(reviewService.getReviewsByCourseId("IN2000")).willReturn(List.of(review1));

        mockMvc.perform(get("/courses/IN2000/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value("IN2000"));
    }
    
    @Test
    void getReviewsByCourseId_NoReviews() throws Exception {
        given(reviewService.getReviewsByCourseId("INXXXX")).willReturn(Collections.emptyList());

        mockMvc.perform(get("/courses/INXXXX/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getReviewsByStudentMatrNr() throws Exception {
        given(reviewService.getReviewsByStudentMatrNr("01234567")).willReturn(List.of(review1));

        mockMvc.perform(get("/students/01234567/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentMatrNr").value("01234567"));
    }

    @Test
    void getAverageRatingByCourseId_whenRatingExists() throws Exception {
        given(reviewService.getAverageRatingByCourseId("IN2000")).willReturn(Optional.of(4.5));

        mockMvc.perform(get("/courses/IN2000/average-rating"))
                .andExpect(status().isOk())
                .andExpect(content().string("4.5"));
    }
    
    @Test
    void getAverageRatingByCourseId_whenNoRating() throws Exception {
        given(reviewService.getAverageRatingByCourseId("INXXXX")).willReturn(Optional.empty());

        mockMvc.perform(get("/courses/INXXXX/average-rating"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReview() throws Exception {
        doNothing().when(reviewService).deleteReview(1);

        mockMvc.perform(delete("/reviews/1"))
                .andExpect(status().isNoContent());
        verify(reviewService).deleteReview(1);
    }
}