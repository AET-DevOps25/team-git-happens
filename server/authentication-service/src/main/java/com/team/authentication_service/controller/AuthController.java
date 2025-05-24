package com.team.authentication_service.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.authentication_service.dto.LoginByEmailRequest;
import com.team.authentication_service.dto.LoginByMatrNrRequest;
import com.team.authentication_service.dto.StudentDTO;
import com.team.authentication_service.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) {               
        this.auth = auth;
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getStudents() {
        List<StudentDTO> student = auth.getStudents();
        if (student == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
        return ResponseEntity.ok(student);
    }

    @Operation(summary = "Register a new student",
               responses = {
                   @ApiResponse(responseCode = "201", description = "Student registered successfully",
                                content = @Content(schema = @Schema(implementation = StudentDTO.class))),
                   @ApiResponse(responseCode = "400", description = "Invalid input data")
               })
    @PostMapping("/register")
    public ResponseEntity<StudentDTO> register(@RequestBody String matriculationNumber,
                                            @RequestBody String name,
                                            @RequestBody String email,
                                            @RequestBody String password) {
        StudentDTO student = auth.registerStudent(matriculationNumber, name, email, password);
        if (student == null) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }

    @Operation(summary = "Login by email",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Login successful"),
                   @ApiResponse(responseCode = "401", description = "Invalid email or password")
               })
    @PostMapping("/login/email")
    public ResponseEntity<String> loginByEmail(@RequestBody LoginByEmailRequest req) {
        boolean loggedIn = auth.loginByEmail(req.email(), req.password());
        if (!loggedIn) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        return ResponseEntity.ok("Login successful");                               
    }

    @Operation(summary = "Login by matriculation number",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Login successful"),
                   @ApiResponse(responseCode = "401", description = "Invalid matriculation number or password")
               })
    @PostMapping("/login/matriculation")    
    public ResponseEntity<String> loginByMatrNr(@RequestBody LoginByMatrNrRequest req) {
        boolean loggedIn = auth.loginByMatrNr(req.matriculationNumber(), req.password());
        if (!loggedIn) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid matriculation number or password");
        }
        return ResponseEntity.ok("Login successful");                                
    }
}
