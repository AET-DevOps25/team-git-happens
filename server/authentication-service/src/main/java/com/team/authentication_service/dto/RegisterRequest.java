package com.team.authentication_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Matriculation number must not be blank")
    @Pattern(regexp = "^[0-9]{8}$", message = "Matriculation number must be exactly 8 digits")
    String matriculationNumber,

    @NotBlank(message = "Name must not be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email should be valid")
    @Pattern(regexp = "^[^@]+@(tum|mytum)\\.de$", message = "E-mail must be a valid TUM address (@tum.de or @mytum.de)")
    String email,

    @NotBlank(message = "Password must not be blank")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    String password
) {}
