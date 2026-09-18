-- 0003_add_food_type.sql
-- Add food_type column to recipes table and update existing records

ALTER TABLE recipes ADD COLUMN food_type TEXT DEFAULT 'vegetarian';

-- Update existing recipes with correct food_type
UPDATE recipes SET food_type = 'non-vegetarian' WHERE name = 'Creamy Tuscan Garlic Chicken' OR name = 'Spicy Chicken Curry';
UPDATE recipes SET food_type = 'vegetarian' WHERE food_type IS NULL OR food_type = '';

CREATE INDEX IF NOT EXISTS idx_recipes_food_type ON recipes(food_type);
