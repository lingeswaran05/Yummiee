package com.yummiee.dto;

public class RecipeSuggestionDTO {
    private RecipeDTO recipe;
    private String mealPeriod;
    private String suggestionTitle;

    public RecipeSuggestionDTO() {}

    public RecipeSuggestionDTO(RecipeDTO recipe, String mealPeriod, String suggestionTitle) {
        this.recipe = recipe;
        this.mealPeriod = mealPeriod;
        this.suggestionTitle = suggestionTitle;
    }

    public RecipeDTO getRecipe() {
        return recipe;
    }

    public void setRecipe(RecipeDTO recipe) {
        this.recipe = recipe;
    }

    public String getMealPeriod() {
        return mealPeriod;
    }

    public void setMealPeriod(String mealPeriod) {
        this.mealPeriod = mealPeriod;
    }

    public String getSuggestionTitle() {
        return suggestionTitle;
    }

    public void setSuggestionTitle(String suggestionTitle) {
        this.suggestionTitle = suggestionTitle;
    }
}
