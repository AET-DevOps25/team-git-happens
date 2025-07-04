package com.team.authentication_service.controller;


import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.authentication_service.dto.LoginByEmailRequest;
import com.team.authentication_service.dto.LoginByMatrNrRequest;
import com.team.authentication_service.dto.LoginResponse;
import com.team.authentication_service.dto.RegisterRequest; // Added import
import com.team.authentication_service.dto.StudentDTO;
import com.team.authentication_service.mapper.StudentMapper;
import com.team.authentication_service.model.Student;
import com.team.authentication_service.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid; // Added import

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) {               
        this.auth = auth;
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getStudents() {
        List<StudentDTO> student = auth.getStudents();
        // Assuming getStudents() never returns null for the list itself, only empty
        return ResponseEntity.ok(student);
    }

    @GetMapping("/students/{matriculationNumber}")
    public ResponseEntity<StudentDTO> getStudentByMatriculationNumber(@PathVariable String matriculationNumber) {
        Optional<StudentDTO> studentDTO = auth.getStudentByMatriculationNumber(matriculationNumber);
        if (!studentDTO.isEmpty()) {
            return ResponseEntity.ok(studentDTO.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @Operation(summary = "Register a new student",
               responses = {
                   @ApiResponse(responseCode = "201", description = "Student registered successfully",
                                content = @Content(schema = @Schema(implementation = StudentDTO.class))),
                   @ApiResponse(responseCode = "400", description = "Invalid input data / Validation error"),
                   @ApiResponse(responseCode = "409", description = "User already exists") // Added for conflicts
               })
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) { // Changed to use RegisterRequest DTO and @Valid
        try {
            StudentDTO student = auth.registerStudent(req.matriculationNumber(), req.name(), req.email(), req.password());
            // No need to check for null, service layer should throw exceptions for failures handled below
            return ResponseEntity.status(HttpStatus.CREATED).body(student);
        } catch (IllegalArgumentException e) {
            // This will catch validation errors from service or if user already exists
            if (e.getMessage().contains("already has an account")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Catch any other unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @Operation(summary = "Login by email",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Login successful",
                                content = @Content(schema = @Schema(implementation = LoginResponse.class))),
                   @ApiResponse(responseCode = "401", description = "Invalid email or password",
                                content = @Content(mediaType = "text/plain")) // Specify error content type
               })
    @PostMapping("/login/email")
    public ResponseEntity<?> loginByEmail(@RequestBody LoginByEmailRequest req) { // Changed LoginResponse to Wildcard
        Student student = auth.loginByEmail(req.email(), req.password());
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .contentType(MediaType.TEXT_PLAIN)
                                 .body("Invalid email or password."); // Added error message
        }
        String token = auth.generateToken(student); 
        StudentDTO studentDTO = StudentMapper.toDTO(student);
        LoginResponse loginResponse = new LoginResponse(token, studentDTO);

        return ResponseEntity.ok(loginResponse); 
    }

    @Operation(summary = "Login by matriculation number",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Login successful",
                                content = @Content(schema = @Schema(implementation = LoginResponse.class))),
                   @ApiResponse(responseCode = "401", description = "Invalid matriculation number or password",
                                content = @Content(mediaType = "text/plain")) // Specify error content type
               })
    @PostMapping("/login/matriculation")    
    public ResponseEntity<?> loginByMatriculation(@RequestBody LoginByMatrNrRequest req) { // Changed LoginResponse to Wildcard
        Student student = auth.loginByMatrNr(req.matriculationNumber(), req.password());
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .contentType(MediaType.TEXT_PLAIN)
                                 .body("Invalid matriculation number or password."); // Added error message
        }
        String token = auth.generateToken(student);
        StudentDTO studentDTO = StudentMapper.toDTO(student);
        LoginResponse loginResponse = new LoginResponse(token, studentDTO);

        return ResponseEntity.ok(loginResponse);
    }
}
