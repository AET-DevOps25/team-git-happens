package com.team.authentication_service.dto;

public class StudentDTO {
    String matriculationNumber;
    String name;
    String email;

    public StudentDTO(String matriculationNumber, String name, String email) {
        this.matriculationNumber = matriculationNumber;
        this.name = name;
        this.email = email;
    }
    public String getMatriculationNumber() {
        return matriculationNumber;
    }
    public String getName() {
        return name;
    }
    public String getEmail() {
        return email;
    }
}
