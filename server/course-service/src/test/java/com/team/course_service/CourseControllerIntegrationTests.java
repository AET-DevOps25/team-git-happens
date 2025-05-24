package com.team.course_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team.course_service.model.Category;
import com.team.course_service.model.Course;
import com.team.course_service.repository.CategoryRepository;
import com.team.course_service.repository.CourseRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional; // Optional, but good for DB tests

import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Ensures each test runs in a transaction and rolls back
public class CourseControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ObjectMapper objectMapper; // For converting objects to JSON strings if needed for POST/PUT

    private Course course1;
    private Course course2;
    private Category category1;
    private Category category2;

    @BeforeEach
    void setUp() {
        // Clear previous data to ensure test isolation
        courseRepository.deleteAll();
        categoryRepository.deleteAll();

        category1 = new Category("Algorithms");
        category2 = new Category("Computer Graphics and Vision");
        categoryRepository.saveAll(List.of(category1, category2));

        course1 = new Course("IN3410", "Selected Topics in Algorithms", "Advanced topics.", 5, Set.of(category1));
        course2 = new Course("IN2390", "Advanced Deep Learning", "Deep learning.", 8, Set.of(category1, category2));
        courseRepository.saveAll(List.of(course1, course2));
    }

    @AfterEach
    void tearDown() {
        // @Transactional handles rollback, but explicit deleteAll can be used if not using @Transactional
        // courseRepository.deleteAll();
        // categoryRepository.deleteAll();
    }

    @Test
    void getAllCourses_shouldReturnListOfCourses() throws Exception {
        mockMvc.perform(get("/courses"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(course1.getId()))) // Order might not be guaranteed, adjust assertion if needed
                .andExpect(jsonPath("$[0].title", is(course1.getTitle())))
                .andExpect(jsonPath("$[1].id", is(course2.getId())))
                .andExpect(jsonPath("$[1].title", is(course2.getTitle())));
        // Add more detailed assertions for categories if necessary
    }

    @Test
    void getCourseById_whenCourseExists_shouldReturnCourseDetails() throws Exception {
        mockMvc.perform(get("/courses/" + course1.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(course1.getId())))
                .andExpect(jsonPath("$.title", is(course1.getTitle())))
                .andExpect(jsonPath("$.description", is(course1.getDescription())))
                .andExpect(jsonPath("$.credits", is(course1.getCredits())))
                .andExpect(jsonPath("$.categories[0].name", is(category1.getName()))); // Assuming one category for course1
    }

    @Test
    void getCourseById_whenCourseDoesNotExist_shouldReturnNotFound() throws Exception {
        String nonExistentId = "NON_EXISTENT_ID";
        mockMvc.perform(get("/courses/" + nonExistentId))
                .andExpect(status().isNotFound());
    }
}
