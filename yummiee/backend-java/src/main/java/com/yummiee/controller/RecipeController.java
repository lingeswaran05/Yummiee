package com.yummiee.controller;

import com.yummiee.dto.RecipeDTO;
import com.yummiee.service.RecipeService;
import com.yummiee.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getRecipes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String sort) {
        List<RecipeDTO> recipes = recipeService.getRecipes(search, category, difficulty, sort);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/my-recipes")
    public ResponseEntity<List<RecipeDTO>> getMyRecipes(HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        List<RecipeDTO> recipes = recipeService.getMyRecipes(userId);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecipeById(@PathVariable Long id) {
        return recipeService.getRecipeById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recipe not found"));
    }

    @PostMapping
    public ResponseEntity<RecipeDTO> createRecipe(@RequestBody RecipeDTO recipeDTO, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        RecipeDTO created = recipeService.createRecipe(recipeDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRecipe(@PathVariable Long id, @RequestBody RecipeDTO recipeDTO, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        return recipeService.updateRecipe(id, recipeDTO, userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recipe not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        boolean deleted = recipeService.deleteRecipe(id, userId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
