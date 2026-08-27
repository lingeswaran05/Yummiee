package com.yummiee.service;

import com.yummiee.dto.*;
import com.yummiee.model.*;
import com.yummiee.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipes(String search, String category, String difficulty, String sort) {
        List<Recipe> recipes = recipeRepository.searchRecipes(search, category, difficulty);

        if ("Quickest".equalsIgnoreCase(sort)) {
            recipes.sort(Comparator.comparing(r -> r.getTimeMinutes() != null ? r.getTimeMinutes() : Integer.MAX_VALUE));
        } else if ("Most Liked".equalsIgnoreCase(sort)) {
            recipes.sort((r1, r2) -> Double.compare(r2.getRating() != null ? r2.getRating() : 0.0,
                    r1.getRating() != null ? r1.getRating() : 0.0));
        } else {
            recipes.sort((r1, r2) -> r2.getId().compareTo(r1.getId()));
        }

        return recipes.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<RecipeDTO> getRecipeById(Long id) {
        return recipeRepository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getMyRecipes(Long userId) {
        List<Recipe> recipes = recipeRepository.findByUserIdOrderByIdDesc(userId);
        return recipes.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public RecipeDTO createRecipe(RecipeDTO dto, Long userId) {
        Recipe recipe = Recipe.builder()
                .userId(userId)
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory() != null ? dto.getCategory() : "Dinner")
                .timeMinutes(dto.getTime() != null ? dto.getTime() : 30)
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : "Easy")
                .servings(dto.getServings() != null ? dto.getServings() : 2)
                .imageUrl(dto.getImage() != null && !dto.getImage().trim().isEmpty() ? dto.getImage() : "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800")
                .rating(4.5)
                .reviewCount(1)
                .notes(dto.getNotes() != null ? dto.getNotes() : "")
                .ingredients(new ArrayList<>())
                .instructions(new ArrayList<>())
                .build();

        if (dto.getIngredients() != null) {
            for (IngredientDTO ingDTO : dto.getIngredients()) {
                Ingredient ing = Ingredient.builder()
                        .recipe(recipe)
                        .name(ingDTO.getName())
                        .quantity(ingDTO.getQuantity() != null ? ingDTO.getQuantity() : 1.0)
                        .unit(ingDTO.getUnit() != null ? ingDTO.getUnit() : "unit")
                        .build();
                recipe.getIngredients().add(ing);
            }
        }

        if (dto.getInstructions() != null) {
            for (int i = 0; i < dto.getInstructions().size(); i++) {
                InstructionDTO instDTO = dto.getInstructions().get(i);
                Instruction inst = Instruction.builder()
                        .recipe(recipe)
                        .stepNumber(instDTO.getStep() != null ? instDTO.getStep() : i + 1)
                        .title(instDTO.getTitle() != null ? instDTO.getTitle() : "Step " + (i + 1))
                        .description(instDTO.getDescription() != null ? instDTO.getDescription() : "")
                        .build();
                recipe.getInstructions().add(inst);
            }
        }

        if (dto.getNutrition() != null) {
            NutritionDTO nutDTO = dto.getNutrition();
            Nutrition nutrition = Nutrition.builder()
                    .recipe(recipe)
                    .calories(nutDTO.getCalories() != null ? nutDTO.getCalories() : 300)
                    .protein(nutDTO.getProtein() != null ? nutDTO.getProtein() : 10)
                    .carbs(nutDTO.getCarbs() != null ? nutDTO.getCarbs() : 30)
                    .fat(nutDTO.getFat() != null ? nutDTO.getFat() : 10)
                    .build();
            recipe.setNutrition(nutrition);
        }

        Recipe saved = recipeRepository.save(recipe);
        return toDTO(saved);
    }

    @Transactional
    public Optional<RecipeDTO> updateRecipe(Long id, RecipeDTO dto, Long userId) {
        return recipeRepository.findById(id)
                .filter(recipe -> Objects.equals(recipe.getUserId(), userId))
                .map(recipe -> {
            if (dto.getName() != null) recipe.setName(dto.getName());
            if (dto.getDescription() != null) recipe.setDescription(dto.getDescription());
            if (dto.getCategory() != null) recipe.setCategory(dto.getCategory());
            if (dto.getTime() != null) recipe.setTimeMinutes(dto.getTime());
            if (dto.getDifficulty() != null) recipe.setDifficulty(dto.getDifficulty());
            if (dto.getServings() != null) recipe.setServings(dto.getServings());
            if (dto.getImage() != null && !dto.getImage().trim().isEmpty()) recipe.setImageUrl(dto.getImage());
            if (dto.getNotes() != null) recipe.setNotes(dto.getNotes());

            if (dto.getIngredients() != null) {
                recipe.getIngredients().clear();
                for (IngredientDTO ingDTO : dto.getIngredients()) {
                    Ingredient ing = Ingredient.builder()
                            .recipe(recipe)
                            .name(ingDTO.getName())
                            .quantity(ingDTO.getQuantity() != null ? ingDTO.getQuantity() : 1.0)
                            .unit(ingDTO.getUnit() != null ? ingDTO.getUnit() : "unit")
                            .build();
                    recipe.getIngredients().add(ing);
                }
            }

            if (dto.getInstructions() != null) {
                recipe.getInstructions().clear();
                for (int i = 0; i < dto.getInstructions().size(); i++) {
                    InstructionDTO instDTO = dto.getInstructions().get(i);
                    Instruction inst = Instruction.builder()
                            .recipe(recipe)
                            .stepNumber(instDTO.getStep() != null ? instDTO.getStep() : i + 1)
                            .title(instDTO.getTitle() != null ? instDTO.getTitle() : "Step " + (i + 1))
                            .description(instDTO.getDescription() != null ? instDTO.getDescription() : "")
                            .build();
                    recipe.getInstructions().add(inst);
                }
            }

            Recipe updated = recipeRepository.save(recipe);
            return toDTO(updated);
        });
    }

    @Transactional
    public boolean deleteRecipe(Long id, Long userId) {
        return recipeRepository.findById(id)
                .filter(recipe -> Objects.equals(recipe.getUserId(), userId))
                .map(recipe -> {
            wishlistRepository.deleteByRecipeId(id);
            recipeRepository.delete(recipe);
            return true;
        }).orElse(false);
    }

    public RecipeDTO toDTO(Recipe recipe) {
        if (recipe == null) return null;

        List<IngredientDTO> ingredientDTOs = recipe.getIngredients() != null ?
                recipe.getIngredients().stream().map(ing -> IngredientDTO.builder()
                        .id(ing.getId())
                        .name(ing.getName())
                        .quantity(ing.getQuantity())
                        .unit(ing.getUnit())
                        .build()).collect(Collectors.toList()) : new ArrayList<>();

        List<InstructionDTO> instructionDTOs = recipe.getInstructions() != null ?
                recipe.getInstructions().stream().map(inst -> InstructionDTO.builder()
                        .step(inst.getStepNumber())
                        .title(inst.getTitle())
                        .description(inst.getDescription())
                        .build()).collect(Collectors.toList()) : new ArrayList<>();

        NutritionDTO nutritionDTO = null;
        if (recipe.getNutrition() != null) {
            Nutrition n = recipe.getNutrition();
            nutritionDTO = NutritionDTO.builder()
                    .calories(n.getCalories())
                    .protein(n.getProtein())
                    .carbs(n.getCarbs())
                    .fat(n.getFat())
                    .build();
        }

        return RecipeDTO.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .description(recipe.getDescription())
                .category(recipe.getCategory())
                .time(recipe.getTimeMinutes())
                .difficulty(recipe.getDifficulty())
                .servings(recipe.getServings())
                .image(recipe.getImageUrl())
                .rating(recipe.getRating() != null ? recipe.getRating() : 4.5)
                .reviews(recipe.getReviewCount() != null ? recipe.getReviewCount() : 0)
                .notes(recipe.getNotes() != null ? recipe.getNotes() : "")
                .ingredients(ingredientDTOs)
                .instructions(instructionDTOs)
                .nutrition(nutritionDTO)
                .build();
    }
}
