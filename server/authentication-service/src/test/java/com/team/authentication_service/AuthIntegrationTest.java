package com.team.authentication_service;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.team.authentication_service.model.Student; 
import com.team.authentication_service.repository.StudentRepository; 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;


@SpringBootTest              
@AutoConfigureMockMvc        
@Transactional    
public class AuthIntegrationTest {

    private static final String APPLICATION_JSON_VALUE = MediaType.APPLICATION_JSON_VALUE;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository; 

    @Autowired
    private PasswordEncoder passwordEncoder; 


    private final String testEmail = "ga44qwe@tum.de";
    private final String testPassword = "pass123";
    private final String randomEmail = "tum.student@tum.de";
    private final String randomPassword = "passsss123";

    @BeforeEach
    void setUpTestData() {
        // Encode password before saving if your service expects encoded passwords
        Student student = new Student("03712312", "Aziz Bouziri", testEmail, passwordEncoder.encode(testPassword));
        studentRepository.save(student);
    }

    @Test
    void loginIntegration_Success() throws Exception {
        // Construct JSON string directly
        String loginRequestJson = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", testEmail, testPassword);

        mockMvc.perform(post("/auth/login/email") 
                        .contentType(APPLICATION_JSON_VALUE)
                        .content(loginRequestJson)) // Use the JSON string
                .andExpect(status().isOk())
                .andExpect(content().string("Login successful")); 
    }

    @Test
    void loginIntegration_Failure_WrongPassword() throws Exception {
        // Construct JSON string directly
        String loginRequestJson = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", testEmail, randomPassword);

        mockMvc.perform(post("/auth/login/email")
                        .contentType(APPLICATION_JSON_VALUE)
                        .content(loginRequestJson)) // Use the JSON string
                .andExpect(status().isUnauthorized()); 
    }

    @Test
    void loginIntegration_Failure_UserNotFound() throws Exception {
        // Construct JSON string directly
        String loginRequestJson = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", randomEmail, testPassword);
        
        mockMvc.perform(post("/auth/login/email")
                        .contentType(APPLICATION_JSON_VALUE)
                        .content(loginRequestJson)) // Use the JSON string
                .andExpect(status().isUnauthorized()); 
    }
               
}
