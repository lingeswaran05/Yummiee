import { useAuth } from "@clerk/react";
import { HashRouter, Navigate, Routes, Route } from "react-router-dom";

import { WishlistProvider } from "./context/WishlistContext";
import { ShoppingListProvider } from "./context/ShoppingListContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import WhatCanICook from "./pages/WhatCanICook";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import RecipeDetails from "./pages/RecipeDetails";
import Wishlist from "./pages/Wishlist";
import ShoppingList from "./pages/ShoppingList";
import MyRecipes from "./pages/MyRecipes";

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }
  return isSignedIn ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/what-can-i-cook" element={<ProtectedRoute><WhatCanICook /></ProtectedRoute>} />
      <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
      <Route path="/add-recipe" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />
      <Route path="/edit-recipe/:id" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
      <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetails /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { isSignedIn, userId } = useAuth();

  return (
    <HashRouter>
      {isSignedIn ? (
        <WishlistProvider key={`wishlist-${userId}`}>
          <ShoppingListProvider key={`shopping-${userId}`}>
            <AppRoutes key={`routes-${userId}`} />
          </ShoppingListProvider>
        </WishlistProvider>
      ) : (
        <AppRoutes key="routes-anonymous" />
      )}
    </HashRouter>
  );
}

export default App;
