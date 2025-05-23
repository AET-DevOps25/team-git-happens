package com.team.course_service.repository;
import com.team.course_service.model.Course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, String> {
    
    List<Course> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT c FROM Course c JOIN c.categories cat WHERE cat.name = :category")
    List<Course> findByCategoryName(@Param("category") String category);

    List<Course> findByCreditsBetween(int minCredits, int maxCredits);
}
