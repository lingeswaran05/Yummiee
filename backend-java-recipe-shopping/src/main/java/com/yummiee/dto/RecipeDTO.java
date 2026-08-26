package com.yummiee.dto;

import java.util.List;

public class RecipeDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private Integer time;
    private String difficulty;
    private Integer servings;
    private String image;
    private Double rating;
    private Integer reviews;
    private String notes;
    private List<IngredientDTO> ingredients;
    private List<InstructionDTO> instructions;
    private NutritionDTO nutrition;

    public RecipeDTO() {}

    public RecipeDTO(Long id, String name, String description, String category, Integer time,
                     String difficulty, Integer servings, String image, Double rating, Integer reviews,
                     String notes, List<IngredientDTO> ingredients, List<InstructionDTO> instructions,
                     NutritionDTO nutrition) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.time = time;
        this.difficulty = difficulty;
        this.servings = servings;
        this.image = image;
        this.rating = rating;
        this.reviews = reviews;
        this.notes = notes;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.nutrition = nutrition;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getTime() { return time; }
    public void setTime(Integer time) { this.time = time; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<IngredientDTO> getIngredients() { return ingredients; }
    public void setIngredients(List<IngredientDTO> ingredients) { this.ingredients = ingredients; }
    public List<InstructionDTO> getInstructions() { return instructions; }
    public void setInstructions(List<InstructionDTO> instructions) { this.instructions = instructions; }
    public NutritionDTO getNutrition() { return nutrition; }
    public void setNutrition(NutritionDTO nutrition) { this.nutrition = nutrition; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private String category;
        private Integer time;
        private String difficulty;
        private Integer servings;
        private String image;
        private Double rating;
        private Integer reviews;
        private String notes;
        private List<IngredientDTO> ingredients;
        private List<InstructionDTO> instructions;
        private NutritionDTO nutrition;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder time(Integer time) { this.time = time; return this; }
        public Builder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public Builder servings(Integer servings) { this.servings = servings; return this; }
        public Builder image(String image) { this.image = image; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder reviews(Integer reviews) { this.reviews = reviews; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder ingredients(List<IngredientDTO> ingredients) { this.ingredients = ingredients; return this; }
        public Builder instructions(List<InstructionDTO> instructions) { this.instructions = instructions; return this; }
        public Builder nutrition(NutritionDTO nutrition) { this.nutrition = nutrition; return this; }

        public RecipeDTO build() {
            return new RecipeDTO(id, name, description, category, time, difficulty, servings, image,
                    rating, reviews, notes, ingredients, instructions, nutrition);
        }
    }
}
