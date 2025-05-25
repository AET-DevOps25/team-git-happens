package com.team.course_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.course_service.dto.CourseDTO;
import com.team.course_service.mapper.CourseMapper;
import com.team.course_service.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/courses")
public class CourseController {
    private final CourseService courseService;
    
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @Operation(
        summary = "Browse all courses", 
        description = "Returns a list of every Informatics course offered in the Master’s programme.",
        responses = {
        @ApiResponse(responseCode = "200",
                     description  = "Page of Master’s Informatics courses",
                     content      = @Content(
                         mediaType = "application/json",
                         schema    = @Schema(implementation = CourseDTO.class)
                     )
        )})
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> result = courseService.getAllCourses().stream().map(CourseMapper::toDto).toList();
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Browse all courses with categories", 
        description = "Returns an Informatics course details given its ID.",
        responses = {
            @ApiResponse(responseCode = "200",
                 description  = "Course found",
                 content      = @Content(
                    mediaType = "application/json",
                    schema    = @Schema(implementation = CourseDTO.class)
                 )),
            @ApiResponse(responseCode = "404", description = "Course not found")
  })
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(
        @Parameter(description = "the course ID") 
        @PathVariable String id) {
        return courseService.getCourseById(id)
                .map(CourseMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
