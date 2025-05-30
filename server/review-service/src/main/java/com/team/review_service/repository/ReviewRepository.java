package com.team.review_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team.review_service.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> getAllReviews();
    List<Review> findByCourseId(String courseId);
    List<Review> findByStudentMatrNr(String studentMatrNr);

}