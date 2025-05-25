package com.team.authentication_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.team.authentication_service.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByMatriculationNumber(String matriculationNumber);
    
    boolean existsByEmail(String email);
    boolean existsByMatriculationNumber(String matriculationNumber);
}