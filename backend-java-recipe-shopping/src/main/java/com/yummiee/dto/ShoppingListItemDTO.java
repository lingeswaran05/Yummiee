package com.yummiee.dto;

public class ShoppingListItemDTO {
    private Long id;
    private String name;
    private Double quantity;
    private String unit;
    private Boolean checked;
    private Long recipeId;
    private String recipeName;

    public ShoppingListItemDTO() {}

    public ShoppingListItemDTO(Long id, String name, Double quantity, String unit, Boolean checked, Long recipeId, String recipeName) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.checked = checked;
        this.recipeId = recipeId;
        this.recipeName = recipeName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Boolean getChecked() { return checked; }
    public void setChecked(Boolean checked) { this.checked = checked; }
    public Long getRecipeId() { return recipeId; }
    public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }
    public String getRecipeName() { return recipeName; }
    public void setRecipeName(String recipeName) { this.recipeName = recipeName; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private Double quantity;
        private String unit;
        private Boolean checked;
        private Long recipeId;
        private String recipeName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder quantity(Double quantity) { this.quantity = quantity; return this; }
        public Builder unit(String unit) { this.unit = unit; return this; }
        public Builder checked(Boolean checked) { this.checked = checked; return this; }
        public Builder recipeId(Long recipeId) { this.recipeId = recipeId; return this; }
        public Builder recipeName(String recipeName) { this.recipeName = recipeName; return this; }

        public ShoppingListItemDTO build() {
            return new ShoppingListItemDTO(id, name, quantity, unit, checked, recipeId, recipeName);
        }
    }
}
