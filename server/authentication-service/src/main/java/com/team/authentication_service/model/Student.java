package com.team.authentication_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @Column(name = "matriculation_number", length = 8, nullable = false, updatable = false)
    @Pattern(regexp = "^[0-9]{8}$")
    String matriculationNumber;

    @Column(nullable = false)
    String name;

    @Column(nullable = false, unique = true)
    @Email(regexp = "^[^@]+@(tum|mytum)\\.de$")
    String email;

    @Column(name = "password_hash", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    String passwordHash;

    protected Student() {}       

    public Student(String matriculationNumber,
                   String name,
                   String email,
                   String passwordHash) {
        this.matriculationNumber = matriculationNumber;
        this.name          = name;
        this.email         = email;
        this.passwordHash  = passwordHash;
    }

    public String getMatriculationNumber() { return matriculationNumber; }
    public String getName()                { return name; }
    public String getEmail()               { return email; }
    public String getPasswordHash()        { return passwordHash; }

}
