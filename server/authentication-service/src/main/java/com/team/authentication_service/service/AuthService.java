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
    private final JwtTokenProvider jwtTokenProvider; 
    
    @Autowired
    public AuthService(StudentRepository studentsRepo, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.studentsRepo = studentsRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider; 
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

    
    public Student loginByEmail(String email, String password) { // Return Student object
        var maybeStudent = studentsRepo.findByEmail(email);
        if (maybeStudent.isEmpty()) {
            System.out.println("findByEmail returned no student for: " + email);
            return null;          
        }
        Student student = maybeStudent.get();
        if (!passwordEncoder.matches(password, student.getPasswordHash())) {
            System.out.println("Password does not match for student: " + email);
            return null;         
        }
        return student;
    }

   
    public Student loginByMatrNr(String matriculationNumber, String password) { 
        var maybeStudent = studentsRepo.findByMatriculationNumber(matriculationNumber);
        if (maybeStudent.isEmpty()) {
            return null;          
        }
        Student student = maybeStudent.get();
        if (!passwordEncoder.matches(password, student.getPasswordHash())) {
            return null;         
        }
        return student; 
    }

    public String generateToken(Student student) {
        return jwtTokenProvider.generateToken(student); 
    }
}
