from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import random

router = APIRouter()

MEAL_TEMPLATES = {
    "vietnamese": {
        "breakfast": [
            {"name": "Phở bò", "foods": ["Rice noodles", "Beef", "Broth", "Herbs"], "calories": 350},
            {"name": "Bánh mì kẹp trứng", "foods": ["Bread", "Egg", "Vegetables"], "calories": 280},
            {"name": "Xôi gà", "foods": ["Sticky rice", "Chicken", "Fried onion"], "calories": 320},
            {"name": "Bánh bao", "foods": ["Steamed bun", "Pork", "Egg"], "calories": 300},
        ],
        "lunch": [
            {"name": "Cơm gà", "foods": ["Rice", "Chicken", "Cucumber", "Sauce"], "calories": 450},
            {"name": "Bún chả", "foods": ["Rice noodles", "Grilled pork", "Herbs"], "calories": 400},
            {"name": "Cơm tấm", "foods": ["Rice", "Grilled pork", "Egg", "Pickled vegetables"], "calories": 480},
            {"name": "Bánh xèo", "foods": ["Rice flour pancake", "Shrimp", "Pork", "Vegetables"], "calories": 420},
        ],
        "dinner": [
            {"name": "Salad gà", "foods": ["Chicken breast", "Mixed greens", "Tomato", "Dressing"], "calories": 350},
            {"name": "Súp gà", "foods": ["Chicken", "Vegetables", "Egg"], "calories": 250},
            {"name": "Rau muống xào", "foods": ["Water spinach", "Garlic", "Oyster sauce"], "calories": 180},
            {"name": "Cơm canh", "foods": ["Rice", "Soup", "Vegetables"], "calories": 350},
        ],
    },
    "asian": {
        "breakfast": [
            {"name": "Congee", "foods": ["Rice porridge", "Ginger", "Scallions"], "calories": 250},
            {"name": "Dim sum", "foods": ["Dumplings", "Steamed buns"], "calories": 300},
            {"name": "Fried rice", "foods": ["Rice", "Egg", "Vegetables", "Soy sauce"], "calories": 380},
        ],
        "lunch": [
            {"name": "Fried noodles", "foods": ["Noodles", "Chicken", "Vegetables"], "calories": 450},
            {"name": "Teriyaki bowl", "foods": ["Rice", "Chicken", "Teriyaki sauce", "Vegetables"], "calories": 480},
            {"name": "Stir fry tofu", "foods": ["Tofu", "Vegetables", "Soy sauce", "Rice"], "calories": 380},
        ],
        "dinner": [
            {"name": "Miso soup", "foods": ["Miso paste", "Tofu", "Seaweed"], "calories": 150},
            {"name": "Grilled fish", "foods": ["Salmon", "Rice", "Vegetables"], "calories": 400},
            {"name": "Hot pot", "foods": ["Various meats", "Vegetables", "Tofu", "Broth"], "calories": 450},
        ],
    },
    "mediterranean": {
        "breakfast": [
            {"name": "Greek yogurt bowl", "foods": ["Greek yogurt", "Honey", "Nuts", "Fruits"], "calories": 280},
            {"name": "Mediterranean toast", "foods": ["Whole grain bread", "Hummus", "Vegetables"], "calories": 250},
            {"name": "Omelette", "foods": ["Eggs", "Feta cheese", "Olives", "Tomatoes"], "calories": 320},
        ],
        "lunch": [
            {"name": "Greek salad", "foods": ["Cucumber", "Tomatoes", "Feta", "Olives", "Olive oil"], "calories": 350},
            {"name": "Falafel wrap", "foods": ["Falafel", "Hummus", "Vegetables", "Pita"], "calories": 420},
            {"name": "Grilled chicken plate", "foods": ["Chicken", "Quinoa", "Vegetables", "Tzatziki"], "calories": 450},
        ],
        "dinner": [
            {"name": "Grilled fish", "foods": ["White fish", "Olive oil", "Lemon", "Vegetables"], "calories": 350},
            {"name": "Lamb kebab", "foods": ["Lamb", "Vegetables", "Rice", "Tzatziki"], "calories": 480},
            {"name": "Vegetable tagine", "foods": ["Various vegetables", "Chickpeas", "Couscous"], "calories": 350},
        ],
    },
    "western": {
        "breakfast": [
            {"name": "Avocado toast", "foods": ["Whole grain bread", "Avocado", "Egg", "Seasonings"], "calories": 300},
            {"name": "Protein pancakes", "foods": ["Pancakes", "Protein powder", "Berries"], "calories": 350},
            {"name": "Breakfast burrito", "foods": ["Tortilla", "Eggs", "Cheese", "Beans"], "calories": 400},
        ],
        "lunch": [
            {"name": "Chicken caesar salad", "foods": ["Romaine", "Chicken", "Parmesan", "Croutons", "Dressing"], "calories": 400},
            {"name": "Turkey sandwich", "foods": ["Whole grain bread", "Turkey", "Cheese", "Vegetables"], "calories": 380},
            {"name": "Chicken wrap", "foods": ["Tortilla", "Chicken", "Vegetables", "Hummus"], "calories": 360},
        ],
        "dinner": [
            {"name": "Grilled steak", "foods": ["Beef steak", "Mashed potatoes", "Vegetables"], "calories": 550},
            {"name": "Baked salmon", "foods": ["Salmon", "Quinoa", "Asparagus"], "calories": 420},
            {"name": "Chicken stir fry", "foods": ["Chicken", "Mixed vegetables", "Brown rice"], "calories": 400},
        ],
    },
}

class MealPlanRequest(BaseModel):
    calories: int
    cuisine: Optional[str] = "vietnamese"
    mealType: str
    ingredients: Optional[List[str]] = []


@router.post("/meal-plan")
async def generate_meal_plan(request: MealPlanRequest):
    cuisine = request.cuisine
    meal_type = request.mealType.lower()
    
    if cuisine not in MEAL_TEMPLATES:
        cuisine = "vietnamese"
    
    if meal_type not in MEAL_TEMPLATES[cuisine]:
        meal_type = "lunch"
    
    available_meals = MEAL_TEMPLATES[cuisine][meal_type]
    selected_meals = random.sample(available_meals, min(3, len(available_meals)))
    
    target_per_meal = request.calories // len(selected_meals)
    
    meals = []
    total_calories = 0
    
    for meal in selected_meals:
        scale = target_per_meal / meal["calories"] if meal["calories"] > 0 else 1
        meal_calories = int(meal["calories"] * scale)
        
        foods = [
            {
                "id": f"food_{i}",
                "name": food,
                "servingSize": 100,
                "servingUnit": "g",
                "calories": int(meal_calories / len(meal["foods"])),
                "protein": random.randint(5, 20),
                "carbohydrates": random.randint(10, 40),
                "fat": random.randint(2, 15),
            }
            for i, food in enumerate(meal["foods"])
        ]
        
        meals.append({
            "name": meal["name"],
            "foods": foods,
            "calories": meal_calories,
            "instructions": f"1. Prepare all ingredients.\n2. Cook {foods[0]['name'].lower()} as the main component.\n3. Add remaining ingredients.\n4. Season to taste and serve."
        })
        
        total_calories += meal_calories
    
    return {
        "meals": meals,
        "totalCalories": total_calories,
        "cuisine": cuisine,
        "mealType": meal_type,
    }
