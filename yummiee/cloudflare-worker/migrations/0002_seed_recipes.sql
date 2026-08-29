-- 0002_seed_recipes.sql
-- Seed initial recipe catalog

-- Recipe 1: Creamy Tuscan Garlic Chicken
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (1, NULL, 'Creamy Tuscan Garlic Chicken', 'Tender chicken breasts in a rich, creamy sun-dried tomato and spinach sauce. Perfect for a cozy weeknight dinner.', 'Dinner', 30, 'Easy', 4, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800', 4.8, 42, 'Serve over fettuccine or with crusty garlic bread to soak up the creamy sauce.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(1, 'Chicken Breasts', 2.0, 'large'),
(1, 'Heavy Cream', 1.0, 'cup'),
(1, 'Sun-dried Tomatoes', 0.5, 'cup'),
(1, 'Fresh Spinach', 2.0, 'cups'),
(1, 'Garlic Cloves', 4.0, 'minced');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(1, 1, 'Sear Chicken', 'Season chicken breasts with salt, pepper, and Italian seasoning. Sear in olive oil over medium-high heat for 6-8 mins per side until golden.'),
(1, 2, 'Make Sauce', 'Remove chicken. In the same skillet, saute garlic, sun-dried tomatoes, and spinach. Pour in heavy cream and simmer until thickened.'),
(1, 3, 'Combine & Serve', 'Return chicken to skillet, coat in creamy Tuscan sauce, and serve warm.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(1, 480, 38, 12, 32);

-- Recipe 2: Avocado Toast with Poached Eggs
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (2, NULL, 'Avocado Toast with Poached Eggs', 'Artisanal sourdough topped with smashed avocado, perfectly poached eggs, microgreens, and red pepper flakes.', 'Breakfast', 15, 'Easy', 2, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', 4.7, 31, 'Use fresh organic eggs for easier poaching.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(2, 'Sourdough Bread', 2.0, 'slices'),
(2, 'Ripe Avocado', 1.0, 'medium'),
(2, 'Eggs', 2.0, 'large');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(2, 1, 'Toast Bread', 'Toast sourdough slices until crispy.'),
(2, 2, 'Poach Eggs', 'Poach eggs in simmering water with vinegar for 3 minutes.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(2, 320, 14, 24, 18);

-- Recipe 3: Creamy Garlic Pasta
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (3, NULL, 'Creamy Garlic Pasta', 'A rich and creamy garlic pasta that is quick, comforting, and perfect for a cozy dinner at home.', 'Dinner', 20, 'Easy', 2, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1400&q=85', 4.8, 124, 'For a lighter version, you can replace some of the heavy cream with milk. Add grilled chicken or mushrooms for extra protein.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(3, 'Pasta', 200.0, 'g'),
(3, 'Garlic', 4.0, 'cloves'),
(3, 'Butter', 2.0, 'tbsp'),
(3, 'Heavy cream', 150.0, 'ml'),
(3, 'Parmesan cheese', 50.0, 'g'),
(3, 'Salt', 1.0, 'tsp'),
(3, 'Black pepper', 0.5, 'tsp'),
(3, 'Parsley', 2.0, 'tbsp');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(3, 1, 'Cook the pasta', 'Bring a large pot of salted water to a boil. Cook the pasta until al dente according to the package instructions. Reserve a little pasta water before draining.'),
(3, 2, 'Prepare the garlic butter', 'Melt the butter in a large pan over medium heat. Add finely minced garlic and cook for about one minute until fragrant.'),
(3, 3, 'Make the creamy sauce', 'Pour in the heavy cream and gently simmer. Add parmesan cheese and stir continuously until the sauce becomes smooth and creamy.'),
(3, 4, 'Combine everything', 'Add the cooked pasta to the sauce. Toss well so every strand is coated. Add a splash of reserved pasta water if the sauce is too thick.'),
(3, 5, 'Season and serve', 'Season with salt and freshly ground black pepper. Finish with chopped parsley and extra parmesan before serving.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(3, 520, 18, 64, 22);

-- Recipe 4: Tomato Rice
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (4, NULL, 'Tomato Rice', 'Simple, flavorful tomato rice made with aromatic spices and fresh tomatoes.', 'Lunch', 30, 'Easy', 4, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1400&q=85', 4.7, 98, 'You can add peas, carrots, capsicum, or leftover vegetables to make this more nutritious.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(4, 'Rice', 2.0, 'cups'),
(4, 'Tomatoes', 3.0, 'medium'),
(4, 'Onion', 1.0, 'medium'),
(4, 'Green chilli', 2.0, 'pieces'),
(4, 'Cooking oil', 2.0, 'tbsp'),
(4, 'Salt', 1.0, 'tsp');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(4, 1, 'Cook the rice', 'Wash and cook the rice until each grain is fluffy. Allow it to cool slightly.'),
(4, 2, 'Prepare the tomato base', 'Heat oil in a pan. Add onions and green chillies and saute until the onions become soft.'),
(4, 3, 'Add tomatoes', 'Add chopped tomatoes and cook until they become soft and the mixture turns into a thick sauce.'),
(4, 4, 'Combine', 'Add the cooked rice and gently mix everything together.'),
(4, 5, 'Serve', 'Season with salt and serve hot with raita or your favorite side dish.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(4, 340, 7, 58, 9);

-- Recipe 5: Vegetable Biryani
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (5, NULL, 'Vegetable Biryani', 'Fragrant basmati rice layered with colorful vegetables, herbs, and aromatic biryani spices.', 'Dinner', 40, 'Medium', 4, 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=1400&q=85', 4.9, 187, 'For extra flavor, add fried onions, saffron milk, or roasted cashews before serving.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(5, 'Basmati rice', 2.0, 'cups'),
(5, 'Mixed vegetables', 300.0, 'g'),
(5, 'Onion', 2.0, 'medium'),
(5, 'Biryani masala', 2.0, 'tbsp'),
(5, 'Cooking oil', 3.0, 'tbsp'),
(5, 'Mint leaves', 0.5, 'cup');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(5, 1, 'Prepare the rice', 'Wash and soak the basmati rice for about 20 minutes. Drain before cooking.'),
(5, 2, 'Saute the vegetables', 'Heat oil and saute sliced onions until golden. Add the mixed vegetables and cook for a few minutes.'),
(5, 3, 'Add spices', 'Add biryani masala and mix well until the vegetables are coated with the spices.'),
(5, 4, 'Cook the biryani', 'Add rice and enough water. Cover and cook until the rice is tender and fluffy.'),
(5, 5, 'Garnish', 'Top with fresh mint leaves and serve hot with raita.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(5, 410, 9, 68, 12);

-- Recipe 6: Fluffy Pancakes
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (6, NULL, 'Fluffy Pancakes', 'Golden, fluffy American-style breakfast pancakes served with maple syrup and fresh berries.', 'Breakfast', 15, 'Easy', 2, 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', 4.9, 88, 'Do not overmix the batter to keep them light and airy.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(6, 'All-purpose Flour', 1.5, 'cups'),
(6, 'Baking Powder', 3.5, 'tsp'),
(6, 'Milk', 1.25, 'cups'),
(6, 'Egg', 1.0, 'large'),
(6, 'Butter', 3.0, 'tbsp melted'),
(6, 'Sugar', 1.0, 'tbsp');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(6, 1, 'Mix Dry Ingredients', 'Sift together flour, baking powder, sugar, and a pinch of salt in a large bowl.'),
(6, 2, 'Mix Wet Ingredients', 'Whisk milk, egg, and melted butter together until smooth.'),
(6, 3, 'Combine Batter', 'Pour wet ingredients into dry and stir just until combined with small lumps remaining.'),
(6, 4, 'Cook Pancakes', 'Heat a lightly oiled griddle over medium heat. Pour 1/4 cup batter per pancake and cook until bubbles pop, then flip and cook until golden.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(6, 350, 8, 52, 11);

-- Recipe 7: Spicy Chicken Curry
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (7, NULL, 'Spicy Chicken Curry', 'A hearty and aromatic chicken curry simmered with onions, garlic, ginger, and rich Indian spices.', 'Dinner', 45, 'Medium', 4, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', 4.8, 140, 'Pairs amazingly with steamed basmati rice or hot garlic naan.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(7, 'Chicken', 500.0, 'g'),
(7, 'Onions', 2.0, 'finely chopped'),
(7, 'Tomatoes', 2.0, 'pureed'),
(7, 'Ginger Garlic Paste', 1.5, 'tbsp'),
(7, 'Garam Masala', 1.0, 'tbsp'),
(7, 'Cooking Oil', 2.0, 'tbsp');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(7, 1, 'Saute Aromatics', 'Heat oil and brown onions until golden. Stir in ginger garlic paste and saute for 2 mins.'),
(7, 2, 'Cook Chicken', 'Add chicken pieces and sear on high heat until the exterior turns white.'),
(7, 3, 'Simmer Gravy', 'Add tomato puree, chili powder, turmeric, and garam masala. Cover and simmer on low for 25 mins until tender.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(7, 420, 36, 14, 24);

-- Recipe 8: Rich Chocolate Brownie
INSERT OR IGNORE INTO recipes (id, user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes)
VALUES (8, NULL, 'Rich Chocolate Brownie', 'Fudgy, decadent dark chocolate brownies with a glossy crackly top.', 'Dessert', 50, 'Easy', 8, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 4.9, 210, 'Enjoy warm with a scoop of vanilla ice cream.');

INSERT OR IGNORE INTO ingredients (recipe_id, name, quantity, unit) VALUES
(8, 'Dark Chocolate', 200.0, 'g'),
(8, 'Butter', 100.0, 'g'),
(8, 'Sugar', 1.0, 'cup'),
(8, 'Eggs', 3.0, 'large'),
(8, 'Cocoa Powder', 0.25, 'cup'),
(8, 'Flour', 0.5, 'cup');

INSERT OR IGNORE INTO instructions (recipe_id, step_number, title, description) VALUES
(8, 1, 'Melt Chocolate & Butter', 'Melt chopped chocolate and butter in a heatproof bowl set over simmering water.'),
(8, 2, 'Beat Eggs & Sugar', 'Whisk eggs and sugar until pale and frothy.'),
(8, 3, 'Fold & Bake', 'Gently fold chocolate mixture and dry ingredients together. Pour into lined tin and bake at 180C (350F) for 25-30 mins.');

INSERT OR IGNORE INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES
(8, 290, 4, 38, 15);
