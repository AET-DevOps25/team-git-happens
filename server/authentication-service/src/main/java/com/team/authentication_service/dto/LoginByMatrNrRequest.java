package com.team.authentication_service.dto;

public record LoginByMatrNrRequest(
        String matriculationNumber,
        String password
) {}
