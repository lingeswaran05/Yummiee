-- 0004_reset_food_types.sql
-- Reset all existing recipes to 'vegetarian' as baseline

UPDATE recipes SET food_type = 'vegetarian';
