import { Heart, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { formatTime } from "../utils/formatTime";

function RecipeCard({ recipe }) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const saved = isInWishlist(recipe.id);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#f0eded] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-[#f6f3f2]">
        <img
          src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800"}
          alt={recipe.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(recipe)}
          aria-label={
            saved
              ? `Remove ${recipe.name} from wishlist`
              : `Add ${recipe.name} to wishlist`
          }
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition ${
            saved
              ? "text-primary"
              : "text-text-secondary hover:text-primary"
          }`}
        >
          <Heart
            className="h-5 w-5"
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-text-primary">
          {recipe.name}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 rounded-full bg-[#f6f3f2] px-3 py-1 text-xs font-semibold text-text-secondary">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {formatTime(recipe.time)}
          </span>

          <span className="flex items-center gap-1 rounded-full bg-[#f6f3f2] px-3 py-1 text-xs font-semibold text-text-secondary">
            <Users className="h-3.5 w-3.5 text-primary" />
            {recipe.servings} servings
          </span>
        </div>

        <Link
          to={`/recipe/${recipe.id}`}
          className="mt-auto pt-5 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          View Recipe →
        </Link>
      </div>
    </div>
  );
}

export default RecipeCard;