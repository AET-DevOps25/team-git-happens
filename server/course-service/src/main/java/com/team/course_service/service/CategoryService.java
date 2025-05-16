package com.team.course_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.team.course_service.model.Category;
import com.team.course_service.repository.CategoryRepository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for managing categories.
 */
@Service
@Transactional(readOnly = true)
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
