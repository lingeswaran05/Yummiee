package com.yummiee.service;

import com.yummiee.dto.IngredientMatchRequest;
import com.yummiee.dto.IngredientMatchResultDTO;
import com.yummiee.dto.RecipeSuggestionDTO;
import com.yummiee.model.Ingredient;
import com.yummiee.model.Recipe;
import com.yummiee.repository.RecipeRepository;
import com.yummiee.repository.WishlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private WishlistRepository wishlistRepository;

    @InjectMocks
    private RecipeService recipeService;

    private Recipe breakfastRecipe;
    private Recipe dinnerRecipe;

    @BeforeEach
    void setUp() {
        breakfastRecipe = Recipe.builder()
                .id(1L)
                .name("Avocado Toast")
                .description("Healthy breakfast toast")
                .category("Breakfast")
                .timeMinutes(15)
                .difficulty("Easy")
                .servings(2)
                .rating(4.8)
                .ingredients(new ArrayList<>())
                .build();

        breakfastRecipe.getIngredients().add(Ingredient.builder().id(10L).recipe(breakfastRecipe).name("Avocado").quantity(1.0).unit("unit").build());
        breakfastRecipe.getIngredients().add(Ingredient.builder().id(11L).recipe(breakfastRecipe).name("Egg").quantity(2.0).unit("pcs").build());
        breakfastRecipe.getIngredients().add(Ingredient.builder().id(12L).recipe(breakfastRecipe).name("Bread").quantity(2.0).unit("slices").build());

        dinnerRecipe = Recipe.builder()
                .id(2L)
                .name("Curd Potato Rice")
                .description("Delicious dinner rice bowl")
                .category("Dinner")
                .timeMinutes(30)
                .difficulty("Easy")
                .servings(2)
                .rating(4.5)
                .ingredients(new ArrayList<>())
                .build();

        dinnerRecipe.getIngredients().add(Ingredient.builder().id(20L).recipe(dinnerRecipe).name("Curd").quantity(1.0).unit("cup").build());
        dinnerRecipe.getIngredients().add(Ingredient.builder().id(21L).recipe(dinnerRecipe).name("Potato").quantity(2.0).unit("pcs").build());
        dinnerRecipe.getIngredients().add(Ingredient.builder().id(22L).recipe(dinnerRecipe).name("Rice").quantity(1.0).unit("cup").build());
    }

    @Test
    void testNormalizeIngredient() {
        assertEquals("curd", recipeService.normalizeIngredient("Yogurt"));
        assertEquals("potato", recipeService.normalizeIngredient("Potatoes"));
        assertEquals("rice", recipeService.normalizeIngredient(" Rice "));
        assertEquals("egg", recipeService.normalizeIngredient("Eggs"));
        assertEquals("chicken", recipeService.normalizeIngredient("Chicken Breasts"));
    }

    @Test
    void testGetRecipeSuggestionMorning() {
        when(recipeRepository.findAll()).thenReturn(List.of(breakfastRecipe, dinnerRecipe));

        Optional<RecipeSuggestionDTO> result = recipeService.getRecipeSuggestion(null, null, 8);
        assertTrue(result.isPresent());
        assertEquals("Breakfast", result.get().getMealPeriod());
        assertEquals("This Morning's Suggestion", result.get().getSuggestionTitle());
        assertEquals("Avocado Toast", result.get().getRecipe().getName());
    }

    @Test
    void testGetRecipeSuggestionNight() {
        when(recipeRepository.findAll()).thenReturn(List.of(breakfastRecipe, dinnerRecipe));

        Optional<RecipeSuggestionDTO> result = recipeService.getRecipeSuggestion(null, null, 21);
        assertTrue(result.isPresent());
        assertEquals("Dinner", result.get().getMealPeriod());
        assertEquals("Tonight's Suggestion", result.get().getSuggestionTitle());
        assertEquals("Curd Potato Rice", result.get().getRecipe().getName());
    }

    @Test
    void testMatchRecipesByIngredientsFullMatch() {
        when(recipeRepository.findAll()).thenReturn(List.of(breakfastRecipe, dinnerRecipe));

        IngredientMatchRequest req = new IngredientMatchRequest(List.of("curd", "potato", "rice"), "Dinner");
        List<IngredientMatchResultDTO> matches = recipeService.matchRecipesByIngredients(req);

        assertEquals(1, matches.size());
        IngredientMatchResultDTO match = matches.get(0);
        assertEquals("Curd Potato Rice", match.getRecipe().getName());
        assertEquals(3, match.getMatchCount());
        assertEquals(3, match.getTotalIngredients());
        assertEquals(100.0, match.getMatchPercentage());
        assertTrue(match.getMissingIngredients().isEmpty());
    }

    @Test
    void testMatchRecipesByIngredientsPartialMatch() {
        when(recipeRepository.findAll()).thenReturn(List.of(breakfastRecipe, dinnerRecipe));

        IngredientMatchRequest req = new IngredientMatchRequest(List.of("egg", "bread"), "Any");
        List<IngredientMatchResultDTO> matches = recipeService.matchRecipesByIngredients(req);

        assertFalse(matches.isEmpty());
        IngredientMatchResultDTO topMatch = matches.get(0);
        assertEquals("Avocado Toast", topMatch.getRecipe().getName());
        assertEquals(2, topMatch.getMatchCount());
        assertEquals(3, topMatch.getTotalIngredients());
        assertEquals(66.7, topMatch.getMatchPercentage());
        assertEquals(1, topMatch.getMissingIngredients().size());
        assertEquals("Avocado", topMatch.getMissingIngredients().get(0));
    }
}
