package com.team.authentication_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team.authentication_service.controller.AuthController;
import com.team.authentication_service.dto.LoginByEmailRequest;
import com.team.authentication_service.dto.LoginByMatrNrRequest;
import com.team.authentication_service.model.Student;
import com.team.authentication_service.service.AuthService;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {
    @Autowired 
    private MockMvc mockMvc;

    @Autowired 
    private ObjectMapper mapper;

    @MockitoBean
    private AuthService authService;

    
    @Test
    void loginByEmail_Success() throws Exception {
        String email = "alice@tum.de";
        String password = "secret";
        String matriculationNumber = "12345678";
        String name = "Alice";
        Student mockStudent = new Student(matriculationNumber, name, email, "hashedPassword");
        String mockToken = "mock-jwt-token-for-" + email;

        Mockito.when(authService.loginByEmail(email, password)).thenReturn(mockStudent);
        Mockito.when(authService.generateToken(mockStudent)).thenReturn(mockToken);

        LoginByEmailRequest req = new LoginByEmailRequest(email, password);

        mockMvc.perform(post("/auth/login/email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value(mockToken))
            .andExpect(jsonPath("$.student.matriculationNumber").value(matriculationNumber))
            .andExpect(jsonPath("$.student.name").value(name))
            .andExpect(jsonPath("$.student.email").value(email));
    }

    @Test
    void loginByEmail_Failure() throws Exception {
        String email = "alice@gmail.com";
        String password = "wrong";
        Mockito.when(authService.loginByEmail(email, password)).thenReturn(null); // Service returns null on failure
        LoginByEmailRequest req = new LoginByEmailRequest(email, password);
               mockMvc.perform(post("/auth/login/email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isUnauthorized())
            .andExpect(content().string("Invalid email or password.")); // Expect specific error message
    }

    @Test
    void loginByMatrNr_Success() throws Exception {
        String matriculationNumber = "87654321";
        String password = "secret";
        String email = "bob@tum.de";
        String name = "Bob";
        Student mockStudent = new Student(matriculationNumber, name, email, "hashedPassword");
        String mockToken = "mock-jwt-token-for-" + email;

        Mockito.when(authService.loginByMatrNr(matriculationNumber, password)).thenReturn(mockStudent);
        Mockito.when(authService.generateToken(mockStudent)).thenReturn(mockToken);

        LoginByMatrNrRequest req = new LoginByMatrNrRequest(matriculationNumber, password);
        mockMvc.perform(post("/auth/login/matriculation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value(mockToken))
            .andExpect(jsonPath("$.student.matriculationNumber").value(matriculationNumber))
            .andExpect(jsonPath("$.student.name").value(name))
            .andExpect(jsonPath("$.student.email").value(email));
    }

    @Test
    void loginByMatrNr_Failure() throws Exception {
        String matriculationNumber = "9897887654321";
        String password = "wrong";
        Mockito.when(authService.loginByMatrNr(matriculationNumber, password))
               .thenReturn(null); // Service returns null on failure

        LoginByMatrNrRequest req = new LoginByMatrNrRequest(matriculationNumber, password);
        mockMvc.perform(post("/auth/login/matriculation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isUnauthorized())
            .andExpect(content().string("Invalid matriculation number or password.")); // Expect specific error message
    }
        
}
