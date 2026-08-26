package com.yummiee.model;

import jakarta.persistence.*;

@Entity
@Table(name = "nutrition")
public class Nutrition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    private Integer calories;

    private Integer protein;

    private Integer carbs;

    private Integer fat;

    public Nutrition() {}

    public Nutrition(Long id, Recipe recipe, Integer calories, Integer protein, Integer carbs, Integer fat) {
        this.id = id;
        this.recipe = recipe;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }
    public Integer getProtein() { return protein; }
    public void setProtein(Integer protein) { this.protein = protein; }
    public Integer getCarbs() { return carbs; }
    public void setCarbs(Integer carbs) { this.carbs = carbs; }
    public Integer getFat() { return fat; }
    public void setFat(Integer fat) { this.fat = fat; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Recipe recipe;
        private Integer calories;
        private Integer protein;
        private Integer carbs;
        private Integer fat;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder recipe(Recipe recipe) { this.recipe = recipe; return this; }
        public Builder calories(Integer calories) { this.calories = calories; return this; }
        public Builder protein(Integer protein) { this.protein = protein; return this; }
        public Builder carbs(Integer carbs) { this.carbs = carbs; return this; }
        public Builder fat(Integer fat) { this.fat = fat; return this; }

        public Nutrition build() {
            return new Nutrition(id, recipe, calories, protein, carbs, fat);
        }
    }
}
