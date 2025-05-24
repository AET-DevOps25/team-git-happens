package com.team.authentication_service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder; 

import com.team.authentication_service.model.Student;
import com.team.authentication_service.repository.StudentRepository;
import com.team.authentication_service.service.AuthService;


import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private StudentRepository repo;

    @Mock // Added mock for PasswordEncoder
    private PasswordEncoder mockedPasswordEncoder;

    @InjectMocks
    private AuthService authService;

    private static final String RAW_PW = "secret";
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    private static final String HASH = encoder.encode(RAW_PW);

    @BeforeEach
    void setUp() {
        //repo = Mockito.mock(StudentRepository.class);
    }

    @Test
    void loginByEmail_Success() {
        Student student = new Student("12345678", "Alice", "alice@tum.de", HASH);
        Mockito.when(repo.findByEmail("alice@tum.de")).thenReturn(Optional.of(student));
        Mockito.when(mockedPasswordEncoder.matches(RAW_PW, HASH)).thenReturn(true);

        boolean loggedIn = authService.loginByEmail("alice@tum.de", RAW_PW);

        assertTrue(loggedIn);
    }

    @Test
    void loginByEmail_WrongPassword() {
        Student student = new Student("12345678", "Alice", "alice@tum.de", HASH);
        Mockito.when(repo.findByEmail("alice@tum.de")).thenReturn(Optional.of(student));
        Mockito.when(mockedPasswordEncoder.matches("wrong_", HASH)).thenReturn(false);

        assertFalse(authService.loginByEmail("alice@tum.de", "wrong_"));
    }

    @Test
    void loginByEmail_NotFound() {
        Mockito.when(repo.findByEmail("bob@tum.de")).thenReturn(Optional.empty());
        assertFalse(authService.loginByEmail("bob@tum.de", RAW_PW));
    }

    @Test
    void loginByMatrNr_Success() {
        Student student = new Student("87654321", "Bob", "bob@tum.de", HASH);
        Mockito.when(repo.findByMatriculationNumber("87654321")).thenReturn(Optional.of(student));
        Mockito.when(mockedPasswordEncoder.matches(RAW_PW, HASH)).thenReturn(true);

        assertTrue(authService.loginByMatrNr("87654321", RAW_PW));
    }

    @Test
    void loginByMatrNr_NotFound() {
        Mockito.when(repo.findByMatriculationNumber("00000000")).thenReturn(Optional.empty());
        assertFalse(authService.loginByMatrNr("00000000", RAW_PW));
    }
}
