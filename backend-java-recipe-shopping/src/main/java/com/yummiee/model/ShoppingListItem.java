package com.yummiee.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shopping_list_items")
public class ShoppingListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "recipe_id")
    private Long recipeId;

    @Column(nullable = false)
    private String name;

    private Double quantity;

    private String unit;

    @Column(nullable = false)
    private Boolean checked;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ShoppingListItem() {}

    public ShoppingListItem(Long id, Long userId, Long recipeId, String name, Double quantity, String unit, Boolean checked, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.recipeId = recipeId;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.checked = checked;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getRecipeId() { return recipeId; }
    public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Boolean getChecked() { return checked; }
    public void setChecked(Boolean checked) { this.checked = checked; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (checked == null) checked = false;
        if (quantity == null) quantity = 1.0;
        if (unit == null) unit = "unit";
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long userId;
        private Long recipeId;
        private String name;
        private Double quantity;
        private String unit;
        private Boolean checked;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder recipeId(Long recipeId) { this.recipeId = recipeId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder quantity(Double quantity) { this.quantity = quantity; return this; }
        public Builder unit(String unit) { this.unit = unit; return this; }
        public Builder checked(Boolean checked) { this.checked = checked; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ShoppingListItem build() {
            return new ShoppingListItem(id, userId, recipeId, name, quantity, unit, checked, createdAt);
        }
    }
}
