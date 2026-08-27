import { useState } from "react";
import { Clock, Users, X, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/formatTime";

function SurpriseMeModal({ isOpen, onClose, suggestionData, onTryAgain, loading }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const recipe = suggestionData?.recipe;
  const title = suggestionData?.suggestionTitle || "Today's Suggestion";

  const handleViewRecipe = () => {
    if (recipe?.id) {
      onClose();
      navigate(`/recipe/${recipe.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-text-secondary transition hover:bg-[#f6f3f2] hover:text-text-primary"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-semibold text-text-secondary">Finding a delicious recipe...</p>
          </div>
        ) : recipe ? (
          <div className="flex flex-col gap-4">
            {/* Image */}
            <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-[#f6f3f2]">
              <img
                src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800"}
                alt={recipe.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Title & Category Badge */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-text-primary leading-snug">
                {recipe.name}
              </h3>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {recipe.category || "General"}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-text-secondary line-clamp-3">
              {recipe.description}
            </p>

            {/* Meta (Time & Servings) */}
            <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{formatTime(recipe.time)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleViewRecipe}
                className="w-full rounded-xl bg-primary py-3.5 text-center font-bold text-white shadow-[0_4px_12px_rgba(174,49,21,0.25)] transition hover:bg-primary-dark"
              >
                View Recipe
              </button>

              <button
                type="button"
                onClick={onTryAgain}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e4e2e1] bg-white py-3 font-bold text-text-primary transition hover:bg-[#f6f3f2]"
              >
                <RefreshCw className="h-4 w-4 text-text-secondary" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-text-secondary">No recommendations available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurpriseMeModal;
