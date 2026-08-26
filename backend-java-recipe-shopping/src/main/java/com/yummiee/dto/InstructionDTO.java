package com.yummiee.dto;

public class InstructionDTO {
    private Integer step;
    private String title;
    private String description;

    public InstructionDTO() {}

    public InstructionDTO(Integer step, String title, String description) {
        this.step = step;
        this.title = title;
        this.description = description;
    }

    public Integer getStep() { return step; }
    public void setStep(Integer step) { this.step = step; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Integer step;
        private String title;
        private String description;

        public Builder step(Integer step) { this.step = step; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public InstructionDTO build() { return new InstructionDTO(step, title, description); }
    }
}
