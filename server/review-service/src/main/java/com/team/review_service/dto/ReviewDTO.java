package com.team.review_service.dto;

import java.time.LocalDateTime;

public class ReviewDTO {
    private Integer reviewId;
    private String courseId;
    private String studentMatrNr;
    private Byte rating;
    private String reviewText;
    private LocalDateTime createdAt;

    public ReviewDTO() {
    }

    public ReviewDTO(Integer reviewId, String courseId, String studentMatrNr, Byte rating, String reviewText, LocalDateTime createdAt) {
        this.reviewId = reviewId;
        this.courseId = courseId;
        this.studentMatrNr = studentMatrNr;
        this.rating = rating;
        this.reviewText = reviewText;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Integer getReviewId() {
        return reviewId;
    }

    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }

    public String getStudentMatrNr() {
        return studentMatrNr;
    }

    public void setStudentMatrNr(String studentMatrNr) {
        this.studentMatrNr = studentMatrNr;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public Byte getRating() {
        return rating;
    }

    public void setRating(Byte rating) {
        this.rating = rating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}