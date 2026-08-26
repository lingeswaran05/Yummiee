# Role: Frontend Authentication & Authorization Module (`frontend-auth`)

## 📌 Assigned Work & Scope
This module is responsible for user registration, authentication, login state management, forgot password flows, and Clerk token API integration.

### Files Included in This Role:
- `src/pages/Login.jsx`: Login page UI, social logins, Clerk SignIn component integration.
- `src/pages/Register.jsx`: Registration page UI, sign-up form controls.
- `src/pages/ForgotPassword.jsx`: Password recovery and reset request screens.
- `src/services/api.js`: API helper function (`getAuthHeaders`, `request`) for attaching Clerk Authorization tokens (`Bearer <token>`) and user ID (`x-clerk-user-id`) headers.

## 🌿 Git Branching & Workflow Instructions

1. **Create your feature branch**:
   ```bash
   git checkout -b feature/frontend-auth
   ```
2. **Work within your assigned files**:
   Edit only `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, or authentication logic in `api.js`.
3. **Commit your changes**:
   ```bash
   git add src/pages/Login.jsx src/pages/Register.jsx src/pages/ForgotPassword.jsx src/services/api.js
   git commit -m "feat(auth): enhance authentication UI and Clerk token handling"
   ```
4. **Push your branch to GitHub**:
   ```bash
   git push -u origin feature/frontend-auth
   ```

### 🛡️ How to Avoid Merge Conflicts:
- Do not edit core UI components (`Sidebar.jsx`, `Dashboard.jsx`, etc.) or global CSS rules in this branch.
- Keep `api.js` updates scoped to authentication header helper functions.
