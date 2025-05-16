package com.team.course_service.mapper;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import com.team.course_service.dto.CategoryDTO;
import com.team.course_service.model.Category;

public class CategoryMapper {
    private CategoryMapper() {
        // Private constructor to prevent instantiation
    }
    
    public static CategoryDTO toDto(Category category) { 
        return new CategoryDTO(category.getName());
     }

    public static Category toEntity(CategoryDTO dto) { 
        return new Category(dto.getName());
     }

    public static Set<CategoryDTO> toDto(Set<Category> categories) {
        if (categories == null || categories.isEmpty()) {
            return Collections.emptySet();
        }
        return categories.stream()
                         .map(CategoryMapper::toDto)
                         .collect(Collectors.toSet());
    }

    public static Set<Category> toEntity(Set<CategoryDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptySet();
        }
        return dtos.stream()
                   .map(CategoryMapper::toEntity)
                   .collect(Collectors.toSet());
    }
}
