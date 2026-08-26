# Role: Database Architecture & Administration (`database-doc`)

## 📌 Scope & Responsibilities
This documentation defines the relational schema, entity relationships, database indexing strategies, data types, and setup instructions for both SQLite3 (`yummiee.db`) and H2 (`yummiee-java-db`).

---

## 🗄️ Database Schemas & DDL Specifications

### 1. `users` Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
```

### 2. `recipes` Table
```sql
CREATE TABLE recipes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    time_minutes INT,
    difficulty VARCHAR(50),
    servings INT,
    image_url VARCHAR(1000),
    rating DOUBLE DEFAULT 4.5,
    review_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
```

### 3. `ingredients` Table
```sql
CREATE TABLE ingredients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipe_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DOUBLE,
    unit VARCHAR(50),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
```

### 4. `instructions` Table
```sql
CREATE TABLE instructions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);
```

### 5. `nutrition` Table
```sql
CREATE TABLE nutrition (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipe_id BIGINT NOT NULL UNIQUE,
    calories INT,
    protein INT,
    carbs INT,
    fat INT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### 6. `wishlist` Table
```sql
CREATE TABLE wishlist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recipe_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE(user_id, recipe_id)
);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
```

### 7. `shopping_list_items` Table
```sql
CREATE TABLE shopping_list_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recipe_id BIGINT,
    name VARCHAR(255) NOT NULL,
    quantity DOUBLE DEFAULT 1.0,
    unit VARCHAR(50) DEFAULT 'unit',
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_shopping_items_user_id ON shopping_list_items(user_id);
```

---

## 🌿 Git Branching Instructions
```bash
git checkout -b doc/database-architecture
git add README.md
git commit -m "docs(db): add relational database DDL schemas, ER mappings, and indexing guide"
git push -u origin doc/database-architecture
```
