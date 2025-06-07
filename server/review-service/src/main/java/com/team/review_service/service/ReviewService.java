package com.team.review_service.service;

import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble; 

import org.springframework.stereotype.Service;
import com.team.review_service.model.Review;
import com.team.review_service.repository.ReviewRepository;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Optional<Review> create(Review review) {
        if (review == null) {
            return Optional.empty(); 
        }
        return Optional.of(reviewRepository.save(review));
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Optional<Review> getReviewById(Integer reviewId) {
        return reviewRepository.findById(reviewId);
    }

    public List<Review> getReviewsByCourseId(String courseId) {
        return reviewRepository.findByCourseId(courseId); 
    }

    public List<Review> getReviewsByStudentMatrNr(String studentMatrNr) {
        return reviewRepository.findByStudentMatrNr(studentMatrNr);
    }

    public void deleteReview(Integer reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    public Optional<Double> getAverageRatingByCourseId(String courseId) {
        List<Review> reviews = reviewRepository.findByCourseId(courseId); 
        if (reviews == null || reviews.isEmpty()) { 
            return Optional.empty();
        }

        OptionalDouble average = reviews.stream()
                .filter(review -> review != null && review.getRating() != null) // Filter out null reviews AND null ratings
                .mapToInt(Review::getRating)      
                .average();

        return average.isPresent() ? Optional.of(average.getAsDouble()) : Optional.empty();
    }
}
