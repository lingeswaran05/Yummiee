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

    @Transactional(readOnly = true)
    public Optional<RecipeSuggestionDTO> getRecipeSuggestion(String clientMealPeriod, Long excludeId, Integer clientHour) {
        List<Recipe> allRecipes = recipeRepository.findAll();
        if (allRecipes.isEmpty()) {
            return Optional.empty();
        }

        int hour = clientHour != null ? clientHour : java.time.LocalTime.now().getHour();
        String activePeriod;
        String suggestionTitle;

        if (clientMealPeriod != null && !clientMealPeriod.trim().isEmpty()) {
            activePeriod = clientMealPeriod.trim();
            suggestionTitle = getTitleForMealPeriod(activePeriod);
        } else {
            if (hour >= 5 && hour < 12) {
                activePeriod = "Breakfast";
                suggestionTitle = "This Morning's Suggestion";
            } else if (hour >= 12 && hour < 17) {
                activePeriod = "Lunch";
                suggestionTitle = "This Afternoon's Suggestion";
            } else if (hour >= 17 && hour < 21) {
                activePeriod = "Snacks";
                suggestionTitle = "This Evening's Suggestion";
            } else {
                activePeriod = "Dinner";
                suggestionTitle = "Tonight's Suggestion";
            }
        }

        // Try 1: Exact meal period category match
        List<Recipe> primaryCandidates = allRecipes.stream()
                .filter(r -> r.getCategory() != null && r.getCategory().equalsIgnoreCase(activePeriod))
                .collect(Collectors.toList());

        List<Recipe> eligibleCandidates = filterExcluded(primaryCandidates, excludeId);

        // Try 2: Compatible Fallbacks if primary candidate list is empty
        if (eligibleCandidates.isEmpty()) {
            List<String> fallbacks = getFallbackCategories(activePeriod);
            for (String fbCategory : fallbacks) {
                List<Recipe> fbMatches = allRecipes.stream()
                        .filter(r -> r.getCategory() != null && r.getCategory().equalsIgnoreCase(fbCategory))
                        .collect(Collectors.toList());
                eligibleCandidates = filterExcluded(fbMatches, excludeId);
                if (!eligibleCandidates.isEmpty()) {
                    break;
                }
            }
        }

        // Try 3: Any recipe in the database if still empty
        if (eligibleCandidates.isEmpty()) {
            eligibleCandidates = filterExcluded(allRecipes, excludeId);
        }

        // Final fallback: allow excludeId if it's the absolute only recipe in DB
        if (eligibleCandidates.isEmpty()) {
            eligibleCandidates = allRecipes;
        }

        // Random selection from eligible candidates
        Random random = new Random();
        Recipe selected = eligibleCandidates.get(random.nextInt(eligibleCandidates.size()));

        return Optional.of(new RecipeSuggestionDTO(toDTO(selected), activePeriod, suggestionTitle));
    }

    private List<Recipe> filterExcluded(List<Recipe> candidates, Long excludeId) {
        if (excludeId == null) return candidates;
        List<Recipe> filtered = candidates.stream()
                .filter(r -> !Objects.equals(r.getId(), excludeId))
                .collect(Collectors.toList());
        return filtered.isEmpty() ? candidates : filtered;
    }

    private String getTitleForMealPeriod(String mealPeriod) {
        if (mealPeriod == null) return "Today's Suggestion";
        switch (mealPeriod.toLowerCase()) {
            case "breakfast": return "This Morning's Suggestion";
            case "lunch": return "This Afternoon's Suggestion";
            case "snacks":
            case "snack": return "This Evening's Suggestion";
            case "dinner": return "Tonight's Suggestion";
            case "dessert": return "Sweet Suggestion";
            default: return "Today's Suggestion";
        }
    }

    private List<String> getFallbackCategories(String mealPeriod) {
        if (mealPeriod == null) return List.of("Lunch", "Dinner", "Breakfast", "Snacks");
        switch (mealPeriod.toLowerCase()) {
            case "breakfast": return List.of("Snacks", "Vegetarian", "Lunch");
            case "lunch": return List.of("Dinner", "Vegetarian", "Snacks");
            case "snacks": return List.of("Dinner", "Lunch", "Vegetarian");
            case "dinner": return List.of("Dessert", "Snacks", "Lunch");
            case "dessert": return List.of("Snacks", "Dinner");
            default: return List.of("Lunch", "Dinner", "Breakfast", "Snacks");
        }
    }

    @Transactional(readOnly = true)
    public List<IngredientMatchResultDTO> matchRecipesByIngredients(IngredientMatchRequest request) {
        if (request == null || request.getIngredients() == null || request.getIngredients().isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> userSet = request.getIngredients().stream()
                .filter(i -> i != null && !i.trim().isEmpty())
                .map(this::normalizeIngredient)
                .filter(i -> !i.isEmpty())
                .collect(Collectors.toSet());

        if (userSet.isEmpty()) {
            return Collections.emptyList();
        }

        List<Recipe> allRecipes = recipeRepository.findAll();
        String categoryFilter = request.getCategory();

        List<IngredientMatchResultDTO> results = new ArrayList<>();

        for (Recipe recipe : allRecipes) {
            if (categoryFilter != null && !categoryFilter.trim().isEmpty() &&
                !"Any".equalsIgnoreCase(categoryFilter.trim()) && !"All".equalsIgnoreCase(categoryFilter.trim())) {
                if (recipe.getCategory() == null || !recipe.getCategory().equalsIgnoreCase(categoryFilter.trim())) {
                    continue;
                }
            }

            List<Ingredient> recipeIngredients = recipe.getIngredients();
            if (recipeIngredients == null || recipeIngredients.isEmpty()) {
                continue;
            }

            int matchedCount = 0;
            List<String> missingIngredients = new ArrayList<>();

            for (Ingredient ing : recipeIngredients) {
                String rawName = ing.getName() != null ? ing.getName() : "";
                String normRecIng = normalizeIngredient(rawName);

                boolean isMatched = isIngredientMatched(normRecIng, userSet);
                if (isMatched) {
                    matchedCount++;
                } else {
                    missingIngredients.add(rawName);
                }
            }

            if (matchedCount > 0) {
                int totalIngredients = recipeIngredients.size();
                double matchPercentage = (matchedCount * 100.0) / totalIngredients;

                results.add(new IngredientMatchResultDTO(
                        toDTO(recipe),
                        matchedCount,
                        totalIngredients,
                        Math.round(matchPercentage * 10.0) / 10.0,
                        missingIngredients
                ));
            }
        }

        results.sort((r1, r2) -> {
            int cmpPerc = Double.compare(r2.getMatchPercentage(), r1.getMatchPercentage());
            if (cmpPerc != 0) return cmpPerc;

            int cmpMatched = Integer.compare(r2.getMatchCount(), r1.getMatchCount());
            if (cmpMatched != 0) return cmpMatched;

            int cmpMissing = Integer.compare(r1.getMissingIngredients().size(), r2.getMissingIngredients().size());
            if (cmpMissing != 0) return cmpMissing;

            double rating1 = r1.getRecipe().getRating() != null ? r1.getRecipe().getRating() : 0.0;
            double rating2 = r2.getRecipe().getRating() != null ? r2.getRecipe().getRating() : 0.0;
            int cmpRating = Double.compare(rating2, rating1);
            if (cmpRating != 0) return cmpRating;

            return r1.getRecipe().getId().compareTo(r2.getRecipe().getId());
        });

        return results;
    }

    private boolean isIngredientMatched(String normRecIng, Set<String> userSet) {
        if (normRecIng.isEmpty()) return false;

        for (String userIng : userSet) {
            if (userIng.isEmpty()) continue;
            if (normRecIng.equals(userIng)) return true;
            if (normRecIng.contains(userIng) || userIng.contains(normRecIng)) return true;
        }
        return false;
    }

    public String normalizeIngredient(String raw) {
        if (raw == null) return "";
        String s = raw.trim().toLowerCase();
        s = s.replaceAll("[^a-z0-9\\s]", "");
        s = s.replaceAll("\\s+", " ").trim();

        if (s.isEmpty()) return "";

        if (s.equals("curd") || s.equals("yogurt") || s.equals("yoghurt") || s.equals("dahi")) return "curd";
        if (s.equals("potato") || s.equals("potatoes") || s.equals("aloo")) return "potato";
        if (s.equals("rice") || s.equals("chawal")) return "rice";
        if (s.equals("paneer") || s.equals("cottage cheese")) return "paneer";
        if (s.equals("onion") || s.equals("onions")) return "onion";
        if (s.equals("tomato") || s.equals("tomatoes")) return "tomato";
        if (s.equals("egg") || s.equals("eggs")) return "egg";
        if (s.equals("carrot") || s.equals("carrots")) return "carrot";
        if (s.contains("chicken")) return "chicken";
        if (s.contains("garlic")) return "garlic";
        if (s.contains("spinach")) return "spinach";
        if (s.contains("cheese") && !s.contains("cottage")) return "cheese";

        if (s.endsWith("es") && s.length() > 4) {
            s = s.substring(0, s.length() - 2);
        } else if (s.endsWith("s") && s.length() > 3 && !s.endsWith("ss")) {
            s = s.substring(0, s.length() - 1);
        }

        return s;
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
