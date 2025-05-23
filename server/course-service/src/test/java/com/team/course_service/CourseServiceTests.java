package com.team.course_service;


import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.team.course_service.model.Course;
import com.team.course_service.repository.CourseRepository;
import com.team.course_service.service.CourseService;

public class CourseServiceTests {
    
    @Mock
    private CourseRepository courseRepo;

    @InjectMocks
    private CourseService courseService;

    private Course sample;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sample = new Course("TST100", "Test", "Desc", 3, null);
    }

    @Test
    void getAllCourses_shouldReturnListFromRepo() {
        when(courseRepo.findAll()).thenReturn(List.of(sample));
        List<Course> all = courseService.getAllCourses();
        assertThat(all).containsExactly(sample);
        verify(courseRepo).findAll();
    }

}
