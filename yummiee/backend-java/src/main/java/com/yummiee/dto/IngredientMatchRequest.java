package com.yummiee.dto;

import java.util.List;

public class IngredientMatchRequest {
    private List<String> ingredients;
    private String category;

    public IngredientMatchRequest() {}

    public IngredientMatchRequest(List<String> ingredients, String category) {
        this.ingredients = ingredients;
        this.category = category;
    }

    public List<String> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
