-- Creates the core table for the authentication-service
CREATE TABLE students (
    matriculation_number VARCHAR(8) PRIMARY KEY
        CHECK (matriculation_number REGEXP '^[0-9]{8}$'),
    name            TEXT        NOT NULL,
    email           VARCHAR(50)        NOT NULL UNIQUE
        CHECK (email REGEXP '^[^@]+@(tum|mytum)\.de$'),
    password_hash   TEXT        NOT NULL
);
