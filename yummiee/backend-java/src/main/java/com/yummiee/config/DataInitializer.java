package com.yummiee.config;

import com.yummiee.model.*;
import com.yummiee.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Set<String> DEFAULT_RECIPE_NAMES = Set.of(
            "Creamy Tuscan Garlic Chicken",
            "Avocado Toast with Poached Eggs");

    @Autowired
    private RecipeRepository recipeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Earlier versions assigned the sample recipes to database user 1.
        // They are catalog recipes, not recipes created by that account.
        List<Recipe> legacySeedRecipes = recipeRepository.findAll().stream()
                .filter(recipe -> DEFAULT_RECIPE_NAMES.contains(recipe.getName()))
                .filter(recipe -> recipe.getUserId() != null)
                .toList();
        legacySeedRecipes.forEach(recipe -> recipe.setUserId(null));
        if (!legacySeedRecipes.isEmpty()) {
            recipeRepository.saveAll(legacySeedRecipes);
        }

        if (recipeRepository.count() == 0) {
            System.out.println("Seeding default recipes into Java Spring Boot Database...");

            // Recipe 1: Creamy Tuscan Garlic Chicken
            Recipe recipe1 = Recipe.builder()
                    .userId(null)
                    .name("Creamy Tuscan Garlic Chicken")
                    .description("Tender chicken breasts in a rich, creamy sun-dried tomato and spinach sauce. Perfect for a cozy weeknight dinner.")
                    .category("Dinner")
                    .timeMinutes(30)
                    .difficulty("Easy")
                    .servings(4)
                    .imageUrl("https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800")
                    .rating(4.8)
                    .reviewCount(42)
                    .notes("Serve over fettuccine or with crusty garlic bread to soak up the creamy sauce.")
                    .ingredients(new ArrayList<>())
                    .instructions(new ArrayList<>())
                    .build();

            recipe1.getIngredients().add(Ingredient.builder().recipe(recipe1).name("Chicken Breasts").quantity(2.0).unit("large").build());
            recipe1.getIngredients().add(Ingredient.builder().recipe(recipe1).name("Heavy Cream").quantity(1.0).unit("cup").build());
            recipe1.getIngredients().add(Ingredient.builder().recipe(recipe1).name("Sun-dried Tomatoes").quantity(0.5).unit("cup").build());
            recipe1.getIngredients().add(Ingredient.builder().recipe(recipe1).name("Fresh Spinach").quantity(2.0).unit("cups").build());
            recipe1.getIngredients().add(Ingredient.builder().recipe(recipe1).name("Garlic Cloves").quantity(4.0).unit("minced").build());

            recipe1.getInstructions().add(Instruction.builder().recipe(recipe1).stepNumber(1).title("Sear Chicken").description("Season chicken breasts with salt, pepper, and Italian seasoning. Sear in olive oil over medium-high heat for 6-8 mins per side until golden.").build());
            recipe1.getInstructions().add(Instruction.builder().recipe(recipe1).stepNumber(2).title("Make Sauce").description("Remove chicken. In the same skillet, saute garlic, sun-dried tomatoes, and spinach. Pour in heavy cream and simmer until thickened.").build());
            recipe1.getInstructions().add(Instruction.builder().recipe(recipe1).stepNumber(3).title("Combine & Serve").description("Return chicken to skillet, coat in creamy Tuscan sauce, and serve warm.").build());

            recipe1.setNutrition(Nutrition.builder().recipe(recipe1).calories(480).protein(38).carbs(12).fat(32).build());
            recipeRepository.save(recipe1);

            // Recipe 2: Avocado Toast with Poached Eggs
            Recipe recipe2 = Recipe.builder()
                    .userId(null)
                    .name("Avocado Toast with Poached Eggs")
                    .description("Artisanal sourdough topped with smashed avocado, perfectly poached eggs, microgreens, and red pepper flakes.")
                    .category("Breakfast")
                    .timeMinutes(15)
                    .difficulty("Easy")
                    .servings(2)
                    .imageUrl("https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800")
                    .rating(4.7)
                    .reviewCount(31)
                    .notes("Use fresh organic eggs for easier poaching.")
                    .ingredients(new ArrayList<>())
                    .instructions(new ArrayList<>())
                    .build();

            recipe2.getIngredients().add(Ingredient.builder().recipe(recipe2).name("Sourdough Bread").quantity(2.0).unit("slices").build());
            recipe2.getIngredients().add(Ingredient.builder().recipe(recipe2).name("Ripe Avocado").quantity(1.0).unit("medium").build());
            recipe2.getIngredients().add(Ingredient.builder().recipe(recipe2).name("Eggs").quantity(2.0).unit("large").build());

            recipe2.getInstructions().add(Instruction.builder().recipe(recipe2).stepNumber(1).title("Toast Bread").description("Toast sourdough slices until crispy.").build());
            recipe2.getInstructions().add(Instruction.builder().recipe(recipe2).stepNumber(2).title("Poach Eggs").description("Poach eggs in simmering water with vinegar for 3 minutes.").build());

            recipe2.setNutrition(Nutrition.builder().recipe(recipe2).calories(320).protein(14).carbs(24).fat(18).build());
            recipeRepository.save(recipe2);

            System.out.println("Default recipes seeded successfully.");
        }
    }
}
