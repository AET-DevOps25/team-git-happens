package com.team.authentication_service.service;

import com.team.authentication_service.model.Student;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private int jwtExpirationMs;

    private SecretKey getSigningKey() {
        // Ensure the secret key is strong enough for HS256
        byte[] keyBytes = jwtSecret.getBytes();
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 256 bits (32 bytes) long.");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Student student) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", student.getMatriculationNumber()); // Use matriculation number as subject
        claims.put("email", student.getEmail());
        claims.put("name", student.getName());
        // Add any other student details you want in the token

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // You can add methods here to validate the token and get claims from it if needed
    // For example:
    // public boolean validateToken(String token) { ... }
    // public String getMatriculationNumberFromJWT(String token) { ... }
}
