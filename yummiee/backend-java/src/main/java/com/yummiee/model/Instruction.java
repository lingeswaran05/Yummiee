package com.yummiee.model;

import jakarta.persistence.*;

@Entity
@Table(name = "instructions")
public class Instruction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "step_number")
    private Integer stepNumber;

    private String title;

    @Column(length = 2000)
    private String description;

    public Instruction() {}

    public Instruction(Long id, Recipe recipe, Integer stepNumber, String title, String description) {
        this.id = id;
        this.recipe = recipe;
        this.stepNumber = stepNumber;
        this.title = title;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Recipe recipe;
        private Integer stepNumber;
        private String title;
        private String description;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder recipe(Recipe recipe) { this.recipe = recipe; return this; }
        public Builder stepNumber(Integer stepNumber) { this.stepNumber = stepNumber; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }

        public Instruction build() {
            return new Instruction(id, recipe, stepNumber, title, description);
        }
    }
}
