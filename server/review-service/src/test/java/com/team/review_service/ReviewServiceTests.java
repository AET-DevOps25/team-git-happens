package com.team.review_service;

import com.team.review_service.model.Review;
import com.team.review_service.repository.ReviewRepository;
import com.team.review_service.service.ReviewService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTests {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewService reviewService;

    private Review review1;
    private Review review2;
    private LocalDateTime fixedTime1 = LocalDateTime.of(2024, 1, 1, 10, 0, 0);
    private LocalDateTime fixedTime2 = LocalDateTime.of(2024, 1, 2, 11, 0, 0);

    @BeforeEach
    void setUp() {
        review1 = new Review();
        review1.setReviewId(1);
        review1.setStudentMatrNr("01234567");
        review1.setCourseId("IN2000");
        review1.setRating((byte) 4);
        review1.setReviewText("Great course!");
        review1.setCreatedAt(fixedTime1); 

        review2 = new Review();
        review2.setReviewId(2);
        review2.setStudentMatrNr("09876543");
        review2.setCourseId("IN2000");
        review2.setRating((byte) 5);
        review2.setReviewText("Excellent!");
        review2.setCreatedAt(fixedTime2); 
    }

    @Test
    void createReview_shouldSaveAndReturnReview() {
        given(reviewRepository.save(any(Review.class))).willReturn(review1);

        Optional<Review> savedReviewOptional = reviewService.create(review1);

        assertThat(savedReviewOptional).isPresent();
        assertThat(savedReviewOptional.get()).isEqualTo(review1);
        verify(reviewRepository).save(review1);
    }

    @Test
    void getReviewById_whenReviewExists_shouldReturnReview() {
        given(reviewRepository.findById(1)).willReturn(Optional.of(review1));

        Optional<Review> foundReview = reviewService.getReviewById(1);

        assertThat(foundReview).isPresent();
        assertThat(foundReview.get()).isEqualTo(review1);
    }

    @Test
    void getReviewById_whenReviewDoesNotExist_shouldReturnEmpty() {
        given(reviewRepository.findById(anyInt())).willReturn(Optional.empty());

        Optional<Review> foundReview = reviewService.getReviewById(999);

        assertThat(foundReview).isNotPresent();
    }

    @Test
    void getReviewsByCourseId_shouldReturnListOfReviews() {
        given(reviewRepository.findByCourseId("IN2000")).willReturn(List.of(review1, review2));

        List<Review> reviews = reviewService.getReviewsByCourseId("IN2000");

        assertThat(reviews).hasSize(2);
        assertThat(reviews).containsExactlyInAnyOrder(review1, review2);
    }

    @Test
    void getReviewsByCourseId_whenNoReviews_shouldReturnEmptyList() {
        given(reviewRepository.findByCourseId(anyString())).willReturn(Collections.emptyList());

        List<Review> reviews = reviewService.getReviewsByCourseId("NON_EXISTENT_COURSE");

        assertThat(reviews).isEmpty();
    }

    @Test
    void getReviewsByStudentMatrNr_shouldReturnListOfReviews() {
        given(reviewRepository.findByStudentMatrNr("01234567")).willReturn(List.of(review1));

        List<Review> reviews = reviewService.getReviewsByStudentMatrNr("01234567");

        assertThat(reviews).hasSize(1);
        assertThat(reviews).containsExactly(review1);
    }

    @Test
    void getAverageRatingByCourseId_whenReviewsExist_shouldReturnAverage() {
        given(reviewRepository.findByCourseId("IN2000")).willReturn(List.of(review1, review2));
        // review1 rating 4, review2 rating 5. Average = 4.5

        Optional<Double> averageRating = reviewService.getAverageRatingByCourseId("IN2000");

        assertThat(averageRating).isPresent();
        assertThat(averageRating.get()).isEqualTo(4.5);
    }

    @Test
    void getAverageRatingByCourseId_whenNoReviews_shouldReturnEmpty() {
        given(reviewRepository.findByCourseId("IN2000")).willReturn(Collections.emptyList());

        Optional<Double> averageRating = reviewService.getAverageRatingByCourseId("IN2000");

        assertThat(averageRating).isNotPresent();
    }
    
    @Test
    void getAverageRatingByCourseId_whenReviewsHaveNullRatings_shouldHandleGracefully() {
        Review reviewWithNullRating = new Review();
        reviewWithNullRating.setCourseId("IN3000");
        // rating is null
        
        Review reviewWithValidRating = new Review();
        reviewWithValidRating.setCourseId("IN3000");
        reviewWithValidRating.setRating((byte)3);

        given(reviewRepository.findByCourseId("IN3000")).willReturn(List.of(reviewWithNullRating, reviewWithValidRating));

        Optional<Double> averageRating = reviewService.getAverageRatingByCourseId("IN3000");
        
        assertThat(averageRating).isPresent();
        assertThat(averageRating.get()).isEqualTo(3.0); // Only valid ratings are considered
    }


    @Test
    void deleteReview_shouldCallRepositoryDeleteById() {
        Integer reviewIdToDelete = 1;
        doNothing().when(reviewRepository).deleteById(reviewIdToDelete);

        reviewService.deleteReview(reviewIdToDelete);

        verify(reviewRepository).deleteById(reviewIdToDelete);
    }

    @Test
    void deleteReview_whenDeletingNonExistentId_shouldCallRepositoryDeleteByIdAndNotThrowError() {
        Integer reviewIdToDelete = 999; 
        doNothing().when(reviewRepository).deleteById(reviewIdToDelete); 

        // We expect no exception to be thrown by the service
        assertDoesNotThrow(() -> reviewService.deleteReview(reviewIdToDelete));

        verify(reviewRepository).deleteById(reviewIdToDelete);
    }
}
