package com.team.review_service.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.team.review_service.dto.ReviewDTO;
import com.team.review_service.mapper.ReviewMapper;
import com.team.review_service.model.Review;
import com.team.review_service.service.ReviewService;


import java.util.Optional;

@RestController
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    public ResponseEntity<ReviewDTO> createReview(@RequestBody ReviewDTO reviewDto) {
        Optional<Review> created = reviewService.create(ReviewMapper.toEntity(reviewDto));
        if (created.isPresent()) {
            URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()                  
                .path("/{id}")                         
                .buildAndExpand(created.get().getReviewId())
                .toUri();

            return ResponseEntity.created(location).body(ReviewMapper.toDto(created.get()));
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        List<Review> reviews = reviewService.getAllReviews();
        List<ReviewDTO> dtos   = ReviewMapper.toDtoList(reviews);
        if (dtos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Integer reviewId) {
        return reviewService.getReviewById(reviewId)
                .map(ReviewMapper::toDto)
                .map(reviewDto -> ResponseEntity.ok().body(reviewDto))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/courses/{courseId}/reviews")
    public ResponseEntity<List<ReviewDTO>> getReviewsByCourseId(@PathVariable String courseId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByCourseId(courseId)
                .stream()
                .map(ReviewMapper::toDto)
                .toList();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/students/{studentMatrNr}/reviews")
    public ResponseEntity<List<ReviewDTO>> getReviewsByStudentMatrNr(@PathVariable String studentMatrNr) {
        List<ReviewDTO> reviews = reviewService.getReviewsByStudentMatrNr(studentMatrNr)
                .stream()
                .map(ReviewMapper::toDto)
                .toList();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/courses/{courseId}/average-rating")
    public ResponseEntity<Double> getAverageRatingByCourseId(@PathVariable String courseId) {
        Optional<Double> averageRating = reviewService.getAverageRatingByCourseId(courseId);
        return averageRating.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
