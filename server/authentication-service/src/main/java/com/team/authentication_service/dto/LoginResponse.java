package com.team.authentication_service.dto;

public class LoginResponse {
    private String token;
    private StudentDTO student;

    public LoginResponse(String token, StudentDTO student) {
        this.token = token;
        this.student = student;
    }

    // Getters
    public String getToken() {
        return token;
    }

    public StudentDTO getStudent() {
        return student;
    }

    // Setters (optional, depending on usage)
    public void setToken(String token) {
        this.token = token;
    }

    public void setStudent(StudentDTO student) {
        this.student = student;
    }
}
