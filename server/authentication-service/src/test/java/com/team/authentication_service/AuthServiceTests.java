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

import com.team.authentication_service.service.JwtTokenProvider; // Added import
import com.team.authentication_service.model.Student;
import com.team.authentication_service.repository.StudentRepository;
import com.team.authentication_service.service.AuthService;


import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify; // Added import
import static org.mockito.Mockito.when; // Added import

@ExtendWith(MockitoExtension.class)
class AuthServiceTest { // Renamed from AuthServiceTests to AuthServiceTest to match common convention
    @Mock
    private StudentRepository repo;

    @Mock 
    private PasswordEncoder mockedPasswordEncoder;

    @Mock // Added mock for JwtTokenProvider
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private static final String RAW_PW = "secret";
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12); // Can be removed if PasswordEncoder is always mocked
    private static final String HASH = encoder.encode(RAW_PW); // Can be removed if PasswordEncoder is always mocked

    @BeforeEach
    void setUp() {
        //repo = Mockito.mock(StudentRepository.class);
    }

    @Test
    void loginByEmail_Success() {
        Student student = new Student("12345678", "Alice", "alice@tum.de", HASH);
        Mockito.when(repo.findByEmail("alice@tum.de")).thenReturn(Optional.of(student));
        Mockito.when(mockedPasswordEncoder.matches(RAW_PW, HASH)).thenReturn(true);

        Student result = authService.loginByEmail("alice@tum.de", RAW_PW);

        assertNotNull(result);
        assertEquals(student.getMatriculationNumber(), result.getMatriculationNumber());
        assertEquals(student.getName(), result.getName());
        assertEquals(student.getEmail(), result.getEmail());
    }

    @Test
    void loginByEmail_WrongPassword() {
        Student student = new Student("12345678", "Alice", "alice@tum.de", HASH);
        Mockito.when(repo.findByEmail("alice@tum.de")).thenReturn(Optional.of(student));
        Mockito.when(mockedPasswordEncoder.matches("wrong_", HASH)).thenReturn(false);

        Student result = authService.loginByEmail("alice@tum.de", "wrong_");
        assertNull(result);
    }

    @Test
    void loginByEmail_NotFound() {
        Mockito.when(repo.findByEmail("bob@tum.de")).thenReturn(Optional.empty());
        Student result = authService.loginByEmail("bob@tum.de", RAW_PW);
        assertNull(result);
    }

    @Test
    void loginByMatrNr_Success() {
        Student student = new Student("87654321", "Bob", "bob@tum.de", HASH);
        Mockito.when(repo.findByMatriculationNumber("87654321")).thenReturn(Optional.of(student));
        Mockito.when(mockedPasswordEncoder.matches(RAW_PW, HASH)).thenReturn(true);

        Student result = authService.loginByMatrNr("87654321", RAW_PW);
        assertNotNull(result);
        assertEquals(student.getMatriculationNumber(), result.getMatriculationNumber());
        assertEquals(student.getName(), result.getName());
        assertEquals(student.getEmail(), result.getEmail());
    }

    @Test
    void loginByMatrNr_NotFound() {
        Mockito.when(repo.findByMatriculationNumber("00000000")).thenReturn(Optional.empty());
        Student result = authService.loginByMatrNr("00000000", RAW_PW);
        assertNull(result);
    }

    @Test
    void generateToken_Success() {
        Student student = new Student("12345678", "Alice", "alice@tum.de", "hashedPassword");
        String expectedToken = "mockGeneratedToken";
        when(jwtTokenProvider.generateToken(student)).thenReturn(expectedToken);

        String actualToken = authService.generateToken(student);

        assertEquals(expectedToken, actualToken);
        verify(jwtTokenProvider).generateToken(student); // Verify that the provider's method was called
    }
}
