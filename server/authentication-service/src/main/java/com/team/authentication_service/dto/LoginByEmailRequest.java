package com.team.authentication_service.dto;

public record LoginByEmailRequest(
    String email,
    String password
) {}
