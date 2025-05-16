package com.team.course_service.model;


import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "course")
public class Course {
    @Id
    private String id;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int credits;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "course_category",
            joinColumns = @jakarta.persistence.JoinColumn(name = "course_id"),
            inverseJoinColumns = @jakarta.persistence.JoinColumn(name = "category_name"))
    @JsonManagedReference
    private Set<Category> categories;

    public Course() {
    }
    public Course(String id, String title, String description, int credits, Set<Category> categories) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.credits = credits;
        this.categories = categories;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public Set<Category> getCategories() { return categories; }
    public void setCategories(Set<Category> categories) { this.categories = categories; }

    @Override
    public String toString() {
        return "Course{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", credits='" + credits + '\'' +
                ", categories='" + categories + '\'' +
                '}';
    }

}
