package com.team.course_service.dto;

import java.util.Set;

public class CourseDTO {
    private String id;
    private String title;
    private String description;
    private int credits;
    private Set<CategoryDTO> categories;

    public CourseDTO() { }

    public CourseDTO(String id, String title, String description, int credits, Set<CategoryDTO> categories) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.credits = credits;
        this.categories = categories;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public Set<CategoryDTO> getCategories() { return categories; }
    public void setCategories(Set<CategoryDTO> categories) { this.categories = categories; }

}
