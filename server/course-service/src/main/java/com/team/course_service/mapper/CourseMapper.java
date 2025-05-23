package com.team.course_service.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import com.team.course_service.dto.CategoryDTO;
import com.team.course_service.dto.CourseDTO;
import com.team.course_service.model.Course;
import com.team.course_service.model.Category;

public class CourseMapper {
    public static CourseDTO toDto(Course course) {
        Set<CategoryDTO> categoryDTOs = course.getCategories().stream()
                .map(c -> new CategoryDTO(c.getName()))
                .collect(Collectors.toSet());
        return new CourseDTO(course.getId(), course.getTitle(), course.getDescription(), course.getCredits(), categoryDTOs);

    }

    public static Course toEntity(CourseDTO dto) {
        Course course = new Course();
        course.setId(dto.getId());
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setCredits(dto.getCredits());
        course.setCategories(dto.getCategories().stream()
                .map(c -> new Category(c.getName()))
                .collect(Collectors.toSet()));
        return course;
    }
}
