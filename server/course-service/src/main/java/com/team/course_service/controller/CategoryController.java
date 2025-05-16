package com.team.course_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.course_service.dto.CategoryDTO;
import com.team.course_service.mapper.CategoryMapper;
import com.team.course_service.service.CategoryService;

@RestController
@RequestMapping("/categories")
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    /**
     * GET /categories
     * Retrieves all categories.
     */
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> list() {
        List<CategoryDTO> result = categoryService.getAllCategories().stream()
            .map(CategoryMapper::toDto)
            .toList();
        return ResponseEntity.ok(result);
    }
}
