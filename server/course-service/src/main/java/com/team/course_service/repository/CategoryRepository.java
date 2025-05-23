package com.team.course_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team.course_service.model.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {
    // Standard CRUD and query operations provided by JpaRepository

}
