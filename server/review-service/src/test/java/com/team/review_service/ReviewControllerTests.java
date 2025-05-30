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
import java.time.format.DateTimeFormatter;
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

    private ReviewDTO reviewResponseDTO; 
    private Review reviewEntity;  
    private LocalDateTime fixedCreationTime = LocalDateTime.of(2024, 1, 1, 12, 0, 0);
    private String fixedCreationTimeString = fixedCreationTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);


    @TestConfiguration
    static class ControllerTestConfig {
        @Bean
        public ReviewService reviewService() {
            return Mockito.mock(ReviewService.class);
        }
    }

    @BeforeEach
    void setUp() {
        // reviewEntity is what the mocked service will work with and return.
        reviewEntity = new Review();
        reviewEntity.setReviewId(1);
        reviewEntity.setCourseId("IN2000");
        reviewEntity.setStudentMatrNr("01234567");
        reviewEntity.setRating((byte) 4);
        reviewEntity.setReviewText("Great course!");
        reviewEntity.setCreatedAt(fixedCreationTime);

        // reviewResponseDTO is what the controller is expected to return, mapped from reviewEntity.
        reviewResponseDTO = ReviewMapper.toDto(reviewEntity); 
    }

    @Test
    void createReview_whenValidInput_shouldReturnCreatedReview() throws Exception {
        // DTO for the request body, typically ID and createdAt are null or not set by client.
        ReviewDTO requestDto = new ReviewDTO(null, "IN2000", "01234567", (byte) 4, "Great course!", null);

        // Mock the service to return the reviewEntity (which has ID and createdAt set)
        given(reviewService.create(any(Review.class))).willReturn(Optional.of(reviewEntity));

        mockMvc.perform(post("/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reviewId").value(reviewEntity.getReviewId()))
                .andExpect(jsonPath("$.studentMatrNr").value(requestDto.getStudentMatrNr()))
                .andExpect(jsonPath("$.courseId").value(requestDto.getCourseId()))
                .andExpect(jsonPath("$.rating").value((int) requestDto.getRating()))
                .andExpect(jsonPath("$.reviewText").value(requestDto.getReviewText()))
                .andExpect(jsonPath("$.createdAt").value(fixedCreationTimeString));
    }

    @Test
    void createReview_whenServiceReturnsEmpty_shouldReturnBadRequest() throws Exception {
        ReviewDTO requestDto = new ReviewDTO(null, "IN2000", "01234567", (byte) 4, "Great course!", null);
        given(reviewService.create(any(Review.class))).willReturn(Optional.empty());

        mockMvc.perform(post("/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getReviewById_whenReviewExists() throws Exception {
        given(reviewService.getReviewById(1)).willReturn(Optional.of(reviewEntity));

        mockMvc.perform(get("/reviews/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewId").value(reviewEntity.getReviewId()))
                .andExpect(jsonPath("$.courseId").value(reviewEntity.getCourseId()))
                .andExpect(jsonPath("$.studentMatrNr").value(reviewEntity.getStudentMatrNr()))
                .andExpect(jsonPath("$.rating").value((int) reviewEntity.getRating()))
                .andExpect(jsonPath("$.reviewText").value(reviewEntity.getReviewText()))
                .andExpect(jsonPath("$.createdAt").value(fixedCreationTimeString));
    }

    @Test
    void getReviewById_whenReviewDoesNotExist() throws Exception {
        given(reviewService.getReviewById(anyInt())).willReturn(Optional.empty());

        mockMvc.perform(get("/reviews/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getReviewsByCourseId() throws Exception {
        given(reviewService.getReviewsByCourseId("IN2000")).willReturn(List.of(reviewEntity));

        mockMvc.perform(get("/courses/IN2000/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reviewId").value(reviewEntity.getReviewId()))
                .andExpect(jsonPath("$[0].courseId").value(reviewEntity.getCourseId()))
                .andExpect(jsonPath("$[0].studentMatrNr").value(reviewEntity.getStudentMatrNr()))
                .andExpect(jsonPath("$[0].createdAt").value(fixedCreationTimeString));
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
        given(reviewService.getReviewsByStudentMatrNr("01234567")).willReturn(List.of(reviewEntity));

        mockMvc.perform(get("/students/01234567/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reviewId").value(reviewEntity.getReviewId()))
                .andExpect(jsonPath("$[0].studentMatrNr").value(reviewEntity.getStudentMatrNr()))
                .andExpect(jsonPath("$[0].createdAt").value(fixedCreationTimeString));
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