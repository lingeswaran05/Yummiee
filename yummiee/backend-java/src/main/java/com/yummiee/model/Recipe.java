package com.yummiee.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    private String category;

    @Column(name = "time_minutes")
    private Integer timeMinutes;

    private String difficulty;

    private Integer servings;

    @Lob
    @Column(name = "image_url", columnDefinition = "CLOB")
    private String imageUrl;

    private Double rating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(length = 2000)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Ingredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Instruction> instructions = new ArrayList<>();

    @OneToOne(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Nutrition nutrition;

    public Recipe() {}

    public Recipe(Long id, Long userId, String name, String description, String category, Integer timeMinutes,
                  String difficulty, Integer servings, String imageUrl, Double rating, Integer reviewCount,
                  String notes, LocalDateTime createdAt, LocalDateTime updatedAt, List<Ingredient> ingredients,
                  List<Instruction> instructions, Nutrition nutrition) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.category = category;
        this.timeMinutes = timeMinutes;
        this.difficulty = difficulty;
        this.servings = servings;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ingredients = ingredients != null ? ingredients : new ArrayList<>();
        this.instructions = instructions != null ? instructions : new ArrayList<>();
        this.nutrition = nutrition;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getTimeMinutes() { return timeMinutes; }
    public void setTimeMinutes(Integer timeMinutes) { this.timeMinutes = timeMinutes; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<Ingredient> getIngredients() { return ingredients; }
    public void setIngredients(List<Ingredient> ingredients) { this.ingredients = ingredients; }
    public List<Instruction> getInstructions() { return instructions; }
    public void setInstructions(List<Instruction> instructions) { this.instructions = instructions; }
    public Nutrition getNutrition() { return nutrition; }
    public void setNutrition(Nutrition nutrition) { this.nutrition = nutrition; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (rating == null) rating = 4.5;
        if (reviewCount == null) reviewCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long userId;
        private String name;
        private String description;
        private String category;
        private Integer timeMinutes;
        private String difficulty;
        private Integer servings;
        private String imageUrl;
        private Double rating;
        private Integer reviewCount;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<Ingredient> ingredients = new ArrayList<>();
        private List<Instruction> instructions = new ArrayList<>();
        private Nutrition nutrition;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder timeMinutes(Integer timeMinutes) { this.timeMinutes = timeMinutes; return this; }
        public Builder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public Builder servings(Integer servings) { this.servings = servings; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder reviewCount(Integer reviewCount) { this.reviewCount = reviewCount; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder ingredients(List<Ingredient> ingredients) { this.ingredients = ingredients; return this; }
        public Builder instructions(List<Instruction> instructions) { this.instructions = instructions; return this; }
        public Builder nutrition(Nutrition nutrition) { this.nutrition = nutrition; return this; }

        public Recipe build() {
            return new Recipe(id, userId, name, description, category, timeMinutes, difficulty, servings,
                    imageUrl, rating, reviewCount, notes, createdAt, updatedAt, ingredients, instructions, nutrition);
        }
    }
}
