# Role: Spring Boot Java Backend - Auth & Wishlist Service (`backend-java-auth-wishlist`)

## 📌 Assigned Work & Scope
This backend service module manages User Entity resolution (Clerk ID extraction, user syncing), Wishlist JPA entities, Wishlist Repositories, Wishlist Controllers, and CORS security configuration.

### Files Included in This Role:
- `com.yummiee.model.User`: User JPA Entity (`clerkUserId`, `email`, `firstName`, `lastName`).
- `com.yummiee.model.Wishlist`: Wishlist JPA Entity (`userId`, `recipeId`).
- `com.yummiee.repository.UserRepository` & `WishlistRepository`: Spring Data JPA Interfaces.
- `com.yummiee.service.UserService`: Helper service parsing `x-clerk-user-id` & Bearer tokens.
- `com.yummiee.service.WishlistService`: Business logic for fetching, adding, and deleting user wishlist items.
- `com.yummiee.controller.WishlistController`: REST endpoints (`/api/wishlist`).
- `com.yummiee.config.CorsConfig`: Spring MVC CORS mapping allowing `*` origins and credentials.

## 🌿 Git Branching & Workflow Instructions

1. **Create your feature branch**:
   ```bash
   git checkout -b feature/backend-auth-wishlist
   ```
2. **Work within your assigned files**:
   Edit user auth resolution and wishlist service files.
3. **Commit your changes**:
   ```bash
   git add src/main/java/com/yummiee/model/User.java src/main/java/com/yummiee/model/Wishlist.java src/main/java/com/yummiee/service/*Wishlist* src/main/java/com/yummiee/controller/WishlistController.java
   git commit -m "feat(backend-auth): implement user authentication resolution & wishlist REST services"
   ```
4. **Push your branch to GitHub**:
   ```bash
   git push -u origin feature/backend-auth-wishlist
   ```

### 🛡️ How to Avoid Merge Conflicts:
- Do not modify `RecipeController.java` or `ShoppingListController.java`.
- Keep `@CrossOrigin` configuration centralized in `CorsConfig.java`.
