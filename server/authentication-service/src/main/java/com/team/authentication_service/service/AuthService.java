package com.team.authentication_service.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.team.authentication_service.dto.StudentDTO;
import com.team.authentication_service.mapper.StudentMapper;
import com.team.authentication_service.model.Student;
import com.team.authentication_service.repository.StudentRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private final StudentRepository studentsRepo;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public AuthService(StudentRepository studentsRepo, PasswordEncoder passwordEncoder) {
        this.studentsRepo = studentsRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<StudentDTO> getStudents() {
        return studentsRepo.findAll()
                .stream()
                .map(StudentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO registerStudent(String matriculationNumber, String name, String email, String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password must not be empty");
        }

        String matrNr = matriculationNumber.trim();
        String mail   = email.trim().toLowerCase();
        String fullName = name.trim();

        // Validation checks
        if (!matrNr.matches("^[0-9]{8}$")) {
            throw new IllegalArgumentException("Matriculation number must be exactly 8 digits");
        }
        if (!mail.matches("^[^@]+@(tum|mytum)\\.de$")) {
            throw new IllegalArgumentException("E‑mail is not a valid TUM address");
        }

        // Uniqueness checks
        if (studentsRepo.existsByMatriculationNumber(matrNr)) {
            throw new IllegalArgumentException("User with the current matriculation number already has an account");
        }
        if (studentsRepo.existsByEmail(mail)) {
            throw new IllegalArgumentException("User with the current e-mail already has an account");
        }
        String hash = passwordEncoder.encode(password);
        Student saved = studentsRepo.save(new Student(matrNr, fullName, mail, hash));
        return StudentMapper.toDTO(saved);    
    }

    
    public boolean loginByEmail(String email, String password) {
        var maybeStudent = studentsRepo.findByEmail(email);
        if (maybeStudent.isEmpty()) {
            System.out.println("findByEmail returned false");
            return false;          
        }
        Student student = maybeStudent.get();
        if (!passwordEncoder.matches(password, student.getPasswordHash())) {
            System.out.println("Password does not match");
            return false;         
        }
        return true;    
    }

   
    public boolean loginByMatrNr(String matriculationNumber, String password) {
        var maybeStudent = studentsRepo.findByMatriculationNumber(matriculationNumber);
        if (maybeStudent.isEmpty()) {
            return false;          
        }
        Student student = maybeStudent.get();
        if (!passwordEncoder.matches(password, student.getPasswordHash())) {
            return false;         
        }
        return true;
    }
}
