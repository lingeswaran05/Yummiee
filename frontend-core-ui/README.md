# Role: Frontend Core UI & Page Navigation Module (`frontend-core-ui`)

## 📌 Assigned Work & Scope
This module is responsible for the main application shell, page routing, recipe catalog dashboard, recipe details view, wishlist view, shopping list view, and global React context state management.

### Files Included in This Role:
- `src/pages/Dashboard.jsx`: Recipe catalog grid, category tabs, search input, difficulty filters, and sort dropdown.
- `src/pages/RecipeDetails.jsx`: Full recipe view (hero banner, ingredient checklists, step-by-step instructions, nutrition summary).
- `src/pages/Wishlist.jsx`: Favorite recipe collection page.
- `src/pages/ShoppingList.jsx`: Interactive grocery checklist page (item check toggling, quantity updates, list clearing).
- `src/components/Sidebar.jsx`: Main navigation sidebar with active link highlights and user profile menu.
- `src/components/RecipeCard.jsx`: Reusable recipe card component with bookmark toggle.
- `src/layouts/MainLayout.jsx`: Page container layout wrapper.
- `src/context/WishlistContext.jsx` & `ShoppingListContext.jsx`: React Context state providers.
- `src/App.jsx`, `src/main.jsx`, `index.html`, `package.json`, `vite.config.js`: Application setup & mock data (`src/data/`).

## 🌿 Git Branching & Workflow Instructions

1. **Create your feature branch**:
   ```bash
   git checkout -b feature/frontend-core-ui
   ```
2. **Work within your assigned files**:
   Edit core pages, navigation components, and context state providers.
3. **Commit your changes**:
   ```bash
   git add src/pages/ src/components/ src/context/ src/App.jsx
   git commit -m "feat(ui): refine dashboard layout, wishlist context, and recipe detail views"
   ```
4. **Push your branch to GitHub**:
   ```bash
   git push -u origin feature/frontend-core-ui
   ```

### 🛡️ How to Avoid Merge Conflicts:
- Do not edit `Login.jsx`, `Register.jsx`, or `Button.css`.
- Keep Context state functions modular (`addToWishlist`, `toggleShoppingItem`).
