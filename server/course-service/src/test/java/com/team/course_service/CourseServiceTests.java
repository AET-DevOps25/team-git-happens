package com.team.course_service;


import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional; // Import for Optional

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team.course_service.model.Course;
import com.team.course_service.repository.CourseRepository;
import com.team.course_service.service.CourseService;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTests {
    
    @Mock
    private CourseRepository courseRepo;

    @InjectMocks
    private CourseService courseService;

    private Course sample;
    private String existingCourseId = "TST100";
    private String nonExistingCourseId = "FAIL001";

    @BeforeEach
    void setUp() {
        sample = new Course(existingCourseId, "Test Course", "Description for test course", 3, null);
    }

    @Test
    void getAllCourses_shouldReturnListFromRepo() {
        when(courseRepo.findAll()).thenReturn(List.of(sample));
        List<Course> all = courseService.getAllCourses();
        assertThat(all).containsExactly(sample);
        verify(courseRepo).findAll();
    }

    @Test
    void getCourseById_whenCourseExists_shouldReturnCourse() {
        when(courseRepo.findById(existingCourseId)).thenReturn(Optional.of(sample));
        Optional<Course> foundCourseOptional = courseService.getCourseById(existingCourseId);
        assertThat(foundCourseOptional).isPresent();
        assertThat(foundCourseOptional.get()).isEqualTo(sample);
        verify(courseRepo).findById(existingCourseId);
    }

    @Test
    void getCourseById_whenCourseDoesNotExist_shouldReturnEmptyOptional() {
        when(courseRepo.findById(nonExistingCourseId)).thenReturn(Optional.empty());
        Optional<Course> foundCourseOptional = courseService.getCourseById(nonExistingCourseId);
        assertThat(foundCourseOptional).isNotPresent(); 
        verify(courseRepo).findById(nonExistingCourseId);
    }

}
