package com.team.course_service.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "category")
public class Category {
    @Id
    @Column(length = 50, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    @JsonBackReference  // Prevents infinite recursion during serialization
    private Set<Course> courses = new HashSet<>();
    
    // Default constructor
    public Category() { }
    // Constructor with name
    public Category(String name) {
        this.name = name;
    }
    // Getters
    public String getName() {
        return name;
    }
    public Set<Course> getCourses() {
        return courses;
    }
}
