package com.team.course_service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.mockito.Mockito; 
import static org.mockito.BDDMockito.given; 
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.team.course_service.controller.CourseController;
import com.team.course_service.model.Category;
import com.team.course_service.model.Course;
import com.team.course_service.service.CourseService;

@WebMvcTest(controllers = CourseController.class)
public class CourseControllerTests {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private CourseService courseService; 

    @TestConfiguration
    static class ControllerTestConfig {

        @Bean
        public CourseService courseService() {
            return Mockito.mock(CourseService.class); 
        }
    }

    @Test
    void getAll_shouldReturnJsonArray() throws Exception {
        Course sample = new Course("TST100","Test","Desc",3, Set.of());
        Course sample2 = new Course("IN2000","Test2","Desc2",5, Set.of()); 

        given(courseService.getAllCourses()).willReturn(List.of(sample, sample2));

        mvc.perform(get("/courses"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$[0].id").value("TST100"))
           .andExpect(jsonPath("$[0].title").value("Test"))
           .andExpect(jsonPath("$[0].description").value("Desc"))
           .andExpect(jsonPath("$[0].credits").value(3))
           .andExpect(jsonPath("$[0].categories").isArray())
           // Removed duplicate status() and contentType() checks
           .andExpect(jsonPath("$[1].id").value("IN2000"))
           .andExpect(jsonPath("$[1].title").value("Test2"))
           .andExpect(jsonPath("$[1].description").value("Desc2"))
           .andExpect(jsonPath("$[1].credits").value(5))
           .andExpect(jsonPath("$[1].categories").isArray());
    }

    @Test
    void getCourseById_whenCourseExists_shouldReturnCourse() throws Exception {
        String courseId = "IN2345";
        Category category = new Category("Software Engineering");
        Course course = new Course(courseId, "Advanced Software Engineering", "Deep dive into SE", 5, Set.of(category));

        given(courseService.getCourseById(courseId)).willReturn(Optional.of(course));

        mvc.perform(get("/courses/" + courseId))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$.id").value(courseId))
           .andExpect(jsonPath("$.title").value("Advanced Software Engineering"))
           .andExpect(jsonPath("$.description").value("Deep dive into SE"))
           .andExpect(jsonPath("$.credits").value(5))
           .andExpect(jsonPath("$.categories").isArray())
           .andExpect(jsonPath("$.categories[0].name").value("Software Engineering")); // Example for category check
    }

    @Test
    void getCourseById_whenCourseDoesNotExist_shouldReturnNotFound() throws Exception {
        String courseId = "NONEXISTENT123";

        given(courseService.getCourseById(courseId)).willReturn(Optional.empty());

        mvc.perform(get("/courses/" + courseId))
           .andExpect(status().isNotFound());
    }

}
