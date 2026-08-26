# Role: Frontend Form Components, CSS Grid & Animations Module (`frontend-form-components`)

## 📌 Assigned Work & Scope
This module is responsible for the Recipe Creation Form (`AddRecipe.jsx`), reusable UI buttons, CSS design tokens, CSS Grid responsive layouts, and keyframe animations.

### Files Included in This Role:
- `src/pages/AddRecipe.jsx`: Add Recipe form component with dynamic ingredient list adding, step-by-step instruction builders, and nutrition inputs.
- `src/components/Button.jsx` & `Button.css`: Reusable UI button design system variants (primary, secondary, danger, ghost, loading spinners).
- `src/App.css`: Animations, custom keyframes, CSS Grid utility classes, glassmorphism card styling.
- `src/index.css`: Global CSS custom properties, color palette tokens, typography definitions.

## 🌿 Git Branching & Workflow Instructions

1. **Create your feature branch**:
   ```bash
   git checkout -b feature/frontend-forms-styles
   ```
2. **Work within your assigned files**:
   Edit `AddRecipe.jsx`, `Button.jsx`, `Button.css`, `App.css`, and `index.css`.
3. **Commit your changes**:
   ```bash
   git add src/pages/AddRecipe.jsx src/components/Button.* src/App.css src/index.css
   git commit -m "feat(ui): add recipe form validation, button styles, and micro-animations"
   ```
4. **Push your branch to GitHub**:
   ```bash
   git push -u origin feature/frontend-forms-styles
   ```

### 🛡️ How to Avoid Merge Conflicts:
- Avoid changing route definitions or authentication token logic.
- Scope custom CSS keyframe animation names cleanly (e.g., `@keyframes fadeIn`, `@keyframes pulseGlow`).
