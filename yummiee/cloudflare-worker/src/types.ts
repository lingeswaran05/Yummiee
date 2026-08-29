export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  ALLOWED_ORIGIN?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_ISSUER?: string;
  CLERK_JWT_KEY?: string;
  CLERK_JWKS_URL?: string;
}

export interface UserRecord {
  id: number;
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface IngredientDTO {
  id?: number;
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface InstructionDTO {
  id?: number;
  step: number;
  title: string;
  description: string;
}

export interface NutritionDTO {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface RecipeDTO {
  id?: number;
  name: string;
  description?: string | null;
  category?: string | null;
  time?: number | null;
  difficulty?: string | null;
  servings?: number | null;
  image?: string | null;
  rating?: number | null;
  reviews?: number | null;
  notes?: string | null;
  ingredients?: IngredientDTO[];
  instructions?: InstructionDTO[];
  nutrition?: NutritionDTO | null;
}

export interface RecipeSuggestionDTO {
  recipe: RecipeDTO;
  mealPeriod: string;
  suggestionTitle: string;
}

export interface IngredientMatchRequest {
  ingredients: string[];
  category?: string;
}

export interface IngredientMatchResultDTO {
  recipe: RecipeDTO;
  matchCount: number;
  totalIngredients: number;
  matchPercentage: number;
  missingIngredients: string[];
}

export interface ShoppingListItemDTO {
  id?: number;
  name: string;
  quantity?: number | null;
  unit?: string | null;
  checked?: boolean;
  recipeId?: number | null;
  recipeName?: string;
}

export interface Variables {
  userId: number;
  clerkUserId: string;
}
