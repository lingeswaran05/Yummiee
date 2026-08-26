# Role: Spring Boot Java Backend - Recipe & Shopping List Service (`backend-java-recipe-shopping`)

## 📌 Assigned Work & Scope
This backend service module manages Recipe catalog entities (Ingredients, Instructions, Nutrition), Shopping List entities, DTO serialization, search/filtering algorithms, recipe CRUD operations, and default database seeding.

### Files Included in This Role:
- `com.yummiee.model.Recipe`, `Ingredient`, `Instruction`, `Nutrition`, `ShoppingListItem`: Domain Entities.
- `com.yummiee.repository.RecipeRepository` & `ShoppingListItemRepository`: Custom JPQL queries for recipe filtering (`searchRecipes`) and shopping list retrieval.
- `com.yummiee.service.RecipeService` & `ShoppingListService`: Recipe CRUD, sorting (`Quickest`, `Most Liked`), and shopping list item updates.
- `com.yummiee.controller.RecipeController` (`/api/recipes`) & `ShoppingListController` (`/api/shopping-list`).
- `com.yummiee.dto.*`: DTO classes (`RecipeDTO`, `IngredientDTO`, `InstructionDTO`, `NutritionDTO`, `ShoppingListItemDTO`).
- `com.yummiee.config.DataInitializer`: Automated seeding of default sample recipes on application startup.
- `com.yummiee.YummieeApplication`: Main application runner.

## 🌿 Git Branching & Workflow Instructions

1. **Create your feature branch**:
   ```bash
   git checkout -b feature/backend-recipe-shopping
   ```
2. **Work within your assigned files**:
   Edit recipe and shopping list services, DTOs, and controllers.
3. **Commit your changes**:
   ```bash
   git add src/main/java/com/yummiee/service/RecipeService.java src/main/java/com/yummiee/service/ShoppingListService.java src/main/java/com/yummiee/controller/
   git commit -m "feat(backend-services): add recipe filtering, DTO mapping, and shopping list CRUD APIs"
   ```
4. **Push your branch to GitHub**:
   ```bash
   git push -u origin feature/backend-recipe-shopping
   ```

### 🛡️ How to Avoid Merge Conflicts:
- Do not edit `UserService.java` or `WishlistService.java`.
- Maintain strict property naming alignment in DTOs (`time`, `image`, `reviews`) to preserve contract compatibility with Frontend API calls.
