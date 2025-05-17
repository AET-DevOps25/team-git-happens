package com.team.course_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.course_service.dto.CategoryDTO;
import com.team.course_service.mapper.CategoryMapper;
import com.team.course_service.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/categories")
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    
    
    @Operation(
        summary     = "Browse all categories",
        description = "Returns a list of every category currently used to classify courses.",
        responses   = {
            @ApiResponse(
                responseCode = "200",
                description  = "List of categories",
                content      = @Content(
                    mediaType = "application/json",
                    schema    = @Schema(implementation = CategoryDTO.class)
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> result = categoryService.getAllCategories().stream()
            .map(CategoryMapper::toDto)
            .toList();
        return ResponseEntity.ok(result);
    }
}
