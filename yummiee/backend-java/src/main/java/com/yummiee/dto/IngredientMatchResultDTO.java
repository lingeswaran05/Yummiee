package com.yummiee.dto;

import java.util.List;

public class IngredientMatchResultDTO {
    private RecipeDTO recipe;
    private Integer matchCount;
    private Integer totalIngredients;
    private Double matchPercentage;
    private List<String> missingIngredients;

    public IngredientMatchResultDTO() {}

    public IngredientMatchResultDTO(RecipeDTO recipe, Integer matchCount, Integer totalIngredients, Double matchPercentage, List<String> missingIngredients) {
        this.recipe = recipe;
        this.matchCount = matchCount;
        this.totalIngredients = totalIngredients;
        this.matchPercentage = matchPercentage;
        this.missingIngredients = missingIngredients;
    }

    public RecipeDTO getRecipe() {
        return recipe;
    }

    public void setRecipe(RecipeDTO recipe) {
        this.recipe = recipe;
    }

    public Integer getMatchCount() {
        return matchCount;
    }

    public void setMatchCount(Integer matchCount) {
        this.matchCount = matchCount;
    }

    public Integer getTotalIngredients() {
        return totalIngredients;
    }

    public void setTotalIngredients(Integer totalIngredients) {
        this.totalIngredients = totalIngredients;
    }

    public Double getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(Double matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMissingIngredients() {
        return missingIngredients;
    }

    public void setMissingIngredients(List<String> missingIngredients) {
        this.missingIngredients = missingIngredients;
    }
}
