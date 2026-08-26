import { HashRouter, Navigate, Routes, Route } from "react-router-dom";

import { WishlistProvider } from "./context/WishlistContext";
import { ShoppingListProvider } from "./context/ShoppingListContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import RecipeDetails from "./pages/RecipeDetails";
import Wishlist from "./pages/Wishlist";
import ShoppingList from "./pages/ShoppingList";
import MyRecipes from "./pages/MyRecipes";

function App() {
  return (
    <HashRouter>
      <WishlistProvider>
        <ShoppingListProvider>

          <Routes>

            <Route
              path="/"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/my-recipes"
              element={<MyRecipes />}
            />

            <Route
              path="/add-recipe"
              element={<AddRecipe />}
            />

            <Route
              path="/edit-recipe/:id"
              element={<EditRecipe />}
            />

            <Route
              path="/recipe/:id"
              element={<RecipeDetails />}
            />

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/shopping-list"
              element={<ShoppingList />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>

        </ShoppingListProvider>
      </WishlistProvider>
    </HashRouter>
  );
}

export default App;
