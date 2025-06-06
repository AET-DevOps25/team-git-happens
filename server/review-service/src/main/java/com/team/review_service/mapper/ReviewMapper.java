package com.team.review_service.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.team.review_service.dto.ReviewDTO;
import com.team.review_service.model.Review;

public class ReviewMapper {
        
    public static ReviewDTO toDto(Review review) {
        if (review == null) {
            return null;
        }
        return new ReviewDTO(
                review.getReviewId(),
                review.getCourseId(),
                review.getStudentMatrNr(),
                review.getRating(),
                review.getReviewText(),
                review.getCreatedAt()
        );
    }

    public static Review toEntity(ReviewDTO reviewDTO) {
        if (reviewDTO == null) {
            return null;
        }
        Review review = new Review();
        review.setReviewId(reviewDTO.getReviewId());
        review.setCourseId(reviewDTO.getCourseId());
        review.setStudentMatrNr(reviewDTO.getStudentMatrNr());
        review.setRating(reviewDTO.getRating());
        review.setReviewText(reviewDTO.getReviewText());
        review.setCreatedAt(reviewDTO.getCreatedAt());
        return review;
    }

public static List<ReviewDTO> toDtoList(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return null;
        }
        return reviews.stream()
                .map(ReviewMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<Review> toEntityList(List<ReviewDTO> reviewDTOs) {
        if (reviewDTOs == null || reviewDTOs.isEmpty()) {
            return null;
        }
        return reviewDTOs.stream()
                .map(ReviewMapper::toEntity)
                .collect(Collectors.toList());
    }
}
