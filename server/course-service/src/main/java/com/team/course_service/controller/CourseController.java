package com.team.course_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.course_service.dto.CourseDTO;
import com.team.course_service.mapper.CourseMapper;
import com.team.course_service.service.CourseService;

@RestController
@RequestMapping("/courses")
public class CourseController {
    private final CourseService courseService;
    
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    /**
     * GET /courses
     * Retrieves all courses.
     */
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> result = courseService.getAllCourses().stream().map(CourseMapper::toDto).toList();
        return ResponseEntity.ok(result);
    }
}
