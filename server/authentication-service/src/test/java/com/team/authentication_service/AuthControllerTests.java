package com.team.authentication_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team.authentication_service.controller.AuthController;
import com.team.authentication_service.dto.LoginByEmailRequest;
import com.team.authentication_service.dto.LoginByMatrNrRequest;
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
        Mockito.when(authService.loginByEmail(email, password)).thenReturn(true);
        LoginByEmailRequest req = new LoginByEmailRequest(email, password);

        mockMvc.perform(post("/auth/login/email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isOk())
            .andExpect(content().string("Login successful"));
         
    }

    @Test
    void loginByEmail_Failure() throws Exception {
        Mockito.when(authService.loginByEmail("alice@gmail.com", "wrong")).thenReturn(false);
        LoginByEmailRequest req = new LoginByEmailRequest("alice@gmail.com", "wrong");
               mockMvc.perform(post("/auth/login/email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isUnauthorized());
    }

    @Test
    void loginByMatrNr_Success() throws Exception {
        Mockito.when(authService.loginByMatrNr("87654321", "secret")).thenReturn(true);

        LoginByMatrNrRequest req = new LoginByMatrNrRequest("87654321", "secret");
        mockMvc.perform(post("/auth/login/matriculation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isOk());
    }

    @Test
    void loginByMatrNr_Failure() throws Exception {
        Mockito.when(authService.loginByMatrNr("9897887654321", "wrong"))
               .thenReturn(false);

        LoginByMatrNrRequest req = new LoginByMatrNrRequest("9897887654321", "wrong");
        mockMvc.perform(post("/auth/login/matriculation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andDo(print()) 
            .andExpect(status().isUnauthorized());
    }
        
}
