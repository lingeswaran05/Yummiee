package com.yummiee.dto;

public class IngredientDTO {
    private Long id;
    private String name;
    private Double quantity;
    private String unit;

    public IngredientDTO() {}

    public IngredientDTO(Long id, String name, Double quantity, String unit) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private Double quantity;
        private String unit;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder quantity(Double quantity) { this.quantity = quantity; return this; }
        public Builder unit(String unit) { this.unit = unit; return this; }
        public IngredientDTO build() { return new IngredientDTO(id, name, quantity, unit); }
    }
}
