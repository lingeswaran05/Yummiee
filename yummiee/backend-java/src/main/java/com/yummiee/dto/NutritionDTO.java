package com.yummiee.dto;

public class NutritionDTO {
    private Integer calories;
    private Integer protein;
    private Integer carbs;
    private Integer fat;

    public NutritionDTO() {}

    public NutritionDTO(Integer calories, Integer protein, Integer carbs, Integer fat) {
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
    }

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
        private Integer calories;
        private Integer protein;
        private Integer carbs;
        private Integer fat;

        public Builder calories(Integer calories) { this.calories = calories; return this; }
        public Builder protein(Integer protein) { this.protein = protein; return this; }
        public Builder carbs(Integer carbs) { this.carbs = carbs; return this; }
        public Builder fat(Integer fat) { this.fat = fat; return this; }
        public NutritionDTO build() { return new NutritionDTO(calories, protein, carbs, fat); }
    }
}
