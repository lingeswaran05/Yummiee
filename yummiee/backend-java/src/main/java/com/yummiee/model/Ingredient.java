package com.yummiee.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private String name;

    private Double quantity;

    private String unit;

    public Ingredient() {}

    public Ingredient(Long id, Recipe recipe, String name, Double quantity, String unit) {
        this.id = id;
        this.recipe = recipe;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Recipe recipe;
        private String name;
        private Double quantity;
        private String unit;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder recipe(Recipe recipe) { this.recipe = recipe; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder quantity(Double quantity) { this.quantity = quantity; return this; }
        public Builder unit(String unit) { this.unit = unit; return this; }

        public Ingredient build() {
            return new Ingredient(id, recipe, name, quantity, unit);
        }
    }
}
