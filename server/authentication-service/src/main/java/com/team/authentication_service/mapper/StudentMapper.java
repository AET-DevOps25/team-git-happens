package com.team.authentication_service.mapper;

import com.team.authentication_service.dto.StudentDTO;
import com.team.authentication_service.model.Student;

public class StudentMapper {
    public static com.team.authentication_service.dto.StudentDTO toDTO(Student student) {
        if (student == null || student.getMatriculationNumber() == null || student.getName() == null || student.getEmail() == null) {
            return null;
        }
        return new StudentDTO(
                student.getMatriculationNumber(),
                student.getName(),
                student.getEmail()
        );
    }

    /* 
    public static com.team.authentication_service.model.Student toModel(com.team.authentication_service.dto.StudentDTO studentDTO) {
        return new com.team.authentication_service.model.Student(
                studentDTO.getMatriculationNumber(),
                studentDTO.getName(),
                studentDTO.getEmail(),
                null 
        );
    }
    */
}
