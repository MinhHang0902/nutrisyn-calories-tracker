-- NutriSyn Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(20) DEFAULT 'male',
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    activity_level VARCHAR(50) DEFAULT 'sedentary',
    goal VARCHAR(50) DEFAULT 'maintain',
    bmi DECIMAL(5,2),
    bmr DECIMAL(10,2),
    tdee DECIMAL(10,2),
    calorie_target DECIMAL(10,2),
    protein_target DECIMAL(10,2),
    carbs_target DECIMAL(10,2),
    fat_target DECIMAL(10,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    foods JSONB NOT NULL,
    total_calories DECIMAL(10,2) NOT NULL,
    total_protein DECIMAL(10,2) NOT NULL,
    total_carbs DECIMAL(10,2) NOT NULL,
    total_fat DECIMAL(10,2) NOT NULL,
    meal_type VARCHAR(20) DEFAULT 'lunch',
    score VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat History table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    assistant_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Nutrition Reference table
CREATE TABLE IF NOT EXISTS nutrition_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    serving_size DECIMAL(10,2),
    serving_unit VARCHAR(50),
    calories DECIMAL(10,2),
    protein DECIMAL(10,2),
    carbohydrates DECIMAL(10,2),
    fat DECIMAL(10,2),
    sugar DECIMAL(10,2),
    fiber DECIMAL(10,2),
    sodium DECIMAL(10,2),
    calcium DECIMAL(10,2),
    iron DECIMAL(10,2),
    UNIQUE(name, serving_size, serving_unit)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_data_name ON nutrition_data(name);

-- Sample nutrition data
INSERT INTO nutrition_data (name, serving_size, serving_unit, calories, protein, carbohydrates, fat, sugar, fiber) VALUES
('Rice (white, cooked)', 100, 'g', 130, 2.7, 28, 0.3, 0, 0.4),
('Rice (brown, cooked)', 100, 'g', 112, 2.6, 24, 0.9, 0.4, 1.8),
('Chicken breast', 100, 'g', 165, 31, 0, 3.6, 0, 0),
('Beef (lean)', 100, 'g', 250, 26, 0, 15, 0, 0),
('Pork', 100, 'g', 242, 27, 0, 14, 0, 0),
('Salmon', 100, 'g', 208, 20, 0, 13, 0, 0),
('Egg (whole)', 50, 'g', 72, 6.3, 0.4, 5, 0.2, 0),
('Tofu', 100, 'g', 76, 8, 1.9, 4.8, 0.6, 0.3),
('Milk (whole)', 240, 'ml', 149, 8, 12, 8, 12, 0),
('Milk (skim)', 240, 'ml', 83, 8, 12, 0.2, 12, 0),
('Yogurt (plain)', 150, 'g', 100, 6, 7, 2.5, 7, 0),
('Greek yogurt', 150, 'g', 100, 17, 6, 0.7, 4, 0),
('Bread (white)', 30, 'g', 79, 2.7, 15, 1, 1.4, 0.8),
('Bread (whole wheat)', 30, 'g', 69, 3.6, 12, 1.1, 1.4, 2),
('Pasta (cooked)', 100, 'g', 131, 5, 25, 1.1, 0.6, 1.8),
('Noodles (rice)', 100, 'g', 109, 0.9, 25, 0.2, 0, 0.9),
('Phở', 400, 'g', 350, 20, 45, 8, 3, 2),
('Bánh mì', 100, 'g', 266, 8, 49, 4, 5, 3),
('Cơm trắng', 150, 'g', 195, 4, 45, 0.4, 0, 0.5),
('Salad (mixed greens)', 50, 'g', 10, 0.7, 2, 0.1, 0.5, 1),
('Tomato', 100, 'g', 18, 0.9, 3.9, 0.2, 2.6, 1.2),
('Cucumber', 100, 'g', 16, 0.7, 3.6, 0.1, 1.7, 0.5),
('Carrot', 100, 'g', 41, 0.9, 10, 0.2, 4.7, 2.8),
('Broccoli', 100, 'g', 34, 2.8, 7, 0.4, 1.7, 2.6),
('Spinach', 100, 'g', 23, 2.9, 3.6, 0.4, 0.4, 2.2),
('Potato', 100, 'g', 77, 2, 17, 0.1, 0.8, 2.2),
('Sweet potato', 100, 'g', 86, 1.6, 20, 0.1, 4.2, 3),
('Banana', 120, 'g', 107, 1.3, 27, 0.4, 14, 3.1),
('Apple', 180, 'g', 95, 0.5, 25, 0.3, 19, 4.4),
('Orange', 130, 'g', 62, 1.2, 15, 0.2, 12, 3.1),
('Mango', 100, 'g', 60, 0.8, 15, 0.4, 14, 1.6),
('Avocado', 100, 'g', 160, 2, 9, 15, 0.7, 7),
('Almonds', 30, 'g', 173, 6, 6, 15, 1.2, 3.5),
('Peanuts', 30, 'g', 161, 7, 5, 14, 1.3, 2.4),
('Olive oil', 15, 'ml', 119, 0, 0, 13.5, 0, 0),
('Butter', 15, 'g', 107, 0.1, 0, 12, 0, 0),
('Sugar', 10, 'g', 39, 0, 10, 0, 10, 0),
('Salt', 1, 'g', 0, 0, 0, 0, 0, 0),
('Honey', 20, 'g', 64, 0.1, 17, 0, 17, 0),
('Coffee (black)', 240, 'ml', 2, 0.3, 0, 0, 0, 0),
('Tea (green)', 240, 'ml', 2, 0, 0, 0, 0, 0);

-- Add avatar column to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
