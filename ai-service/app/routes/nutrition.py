from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Optional
import random
import io
import json
import os
import httpx
from PIL import Image
import google.generativeai as genai

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

NUTRITION_DB = {
    "rice": {"name": "Rice (white, cooked)", "serving_size": 100, "serving_unit": "g", "calories": 130, "protein": 2.7, "carbohydrates": 28, "fat": 0.3, "sugar": 0, "fiber": 0.4},
    "chicken": {"name": "Chicken breast", "serving_size": 100, "serving_unit": "g", "calories": 165, "protein": 31, "carbohydrates": 0, "fat": 3.6, "sugar": 0, "fiber": 0},
    "beef": {"name": "Beef (lean)", "serving_size": 100, "serving_unit": "g", "calories": 250, "protein": 26, "carbohydrates": 0, "fat": 15, "sugar": 0, "fiber": 0},
    "pork": {"name": "Pork", "serving_size": 100, "serving_unit": "g", "calories": 242, "protein": 27, "carbohydrates": 0, "fat": 14, "sugar": 0, "fiber": 0},
    "salmon": {"name": "Salmon", "serving_size": 100, "serving_unit": "g", "calories": 208, "protein": 20, "carbohydrates": 0, "fat": 13, "sugar": 0, "fiber": 0},
    "egg": {"name": "Egg (whole)", "serving_size": 50, "serving_unit": "g", "calories": 72, "protein": 6.3, "carbohydrates": 0.4, "fat": 5, "sugar": 0.2, "fiber": 0},
    "tofu": {"name": "Tofu", "serving_size": 100, "serving_unit": "g", "calories": 76, "protein": 8, "carbohydrates": 1.9, "fat": 4.8, "sugar": 0.6, "fiber": 0.3},
    "milk": {"name": "Milk (whole)", "serving_size": 240, "serving_unit": "ml", "calories": 149, "protein": 8, "carbohydrates": 12, "fat": 8, "sugar": 12, "fiber": 0},
    "bread": {"name": "Bread (white)", "serving_size": 30, "serving_unit": "g", "calories": 79, "protein": 2.7, "carbohydrates": 15, "fat": 1, "sugar": 1.4, "fiber": 0.8},
    "noodle": {"name": "Noodles (rice)", "serving_size": 100, "serving_unit": "g", "calories": 109, "protein": 0.9, "carbohydrates": 25, "fat": 0.2, "sugar": 0, "fiber": 0.9},
    "pho": {"name": "Phở", "serving_size": 400, "serving_unit": "g", "calories": 350, "protein": 20, "carbohydrates": 45, "fat": 8, "sugar": 3, "fiber": 2},
    "salad": {"name": "Salad (mixed greens)", "serving_size": 50, "serving_unit": "g", "calories": 10, "protein": 0.7, "carbohydrates": 2, "fat": 0.1, "sugar": 0.5, "fiber": 1},
    "tomato": {"name": "Tomato", "serving_size": 100, "serving_unit": "g", "calories": 18, "protein": 0.9, "carbohydrates": 3.9, "fat": 0.2, "sugar": 2.6, "fiber": 1.2},
    "cucumber": {"name": "Cucumber", "serving_size": 100, "serving_unit": "g", "calories": 16, "protein": 0.7, "carbohydrates": 3.6, "fat": 0.1, "sugar": 1.7, "fiber": 0.5},
    "carrot": {"name": "Carrot", "serving_size": 100, "serving_unit": "g", "calories": 41, "protein": 0.9, "carbohydrates": 10, "fat": 0.2, "sugar": 4.7, "fiber": 2.8},
    "broccoli": {"name": "Broccoli", "serving_size": 100, "serving_unit": "g", "calories": 34, "protein": 2.8, "carbohydrates": 7, "fat": 0.4, "sugar": 1.7, "fiber": 2.6},
    "potato": {"name": "Potato", "serving_size": 100, "serving_unit": "g", "calories": 77, "protein": 2, "carbohydrates": 17, "fat": 0.1, "sugar": 0.8, "fiber": 2.2},
    "banana": {"name": "Banana", "serving_size": 120, "serving_unit": "g", "calories": 107, "protein": 1.3, "carbohydrates": 27, "fat": 0.4, "sugar": 14, "fiber": 3.1},
    "apple": {"name": "Apple", "serving_size": 180, "serving_unit": "g", "calories": 95, "protein": 0.5, "carbohydrates": 25, "fat": 0.3, "sugar": 19, "fiber": 4.4},
    "orange": {"name": "Orange", "serving_size": 130, "serving_unit": "g", "calories": 62, "protein": 1.2, "carbohydrates": 15, "fat": 0.2, "sugar": 12, "fiber": 3.1},
    "avocado": {"name": "Avocado", "serving_size": 100, "serving_unit": "g", "calories": 160, "protein": 2, "carbohydrates": 9, "fat": 15, "sugar": 0.7, "fiber": 7},
    "steak": {"name": "Beef steak", "serving_size": 150, "serving_unit": "g", "calories": 375, "protein": 39, "carbohydrates": 0, "fat": 24, "sugar": 0, "fiber": 0},
    "pizza": {"name": "Pizza", "serving_size": 100, "serving_unit": "g", "calories": 266, "protein": 11, "carbohydrates": 33, "fat": 10, "sugar": 4, "fiber": 2},
    "burger": {"name": "Hamburger", "serving_size": 100, "serving_unit": "g", "calories": 295, "protein": 17, "carbohydrates": 24, "fat": 14, "sugar": 5, "fiber": 1},
    "fries": {"name": "French fries", "serving_size": 100, "serving_unit": "g", "calories": 312, "protein": 3.4, "carbohydrates": 41, "fat": 15, "sugar": 0.3, "fiber": 3.8},
}

FOOD_CLASSES = [
    "rice", "chicken", "beef", "pork", "salmon", "egg", "tofu", "milk",
    "bread", "noodle", "pho", "salad", "tomato", "cucumber", "carrot",
    "broccoli", "potato", "banana", "apple", "orange", "avocado"
]

async def parse_nutrition_from_gemini(food_name: str, serving_size: Optional[int] = None, serving_unit: Optional[str] = None) -> Optional[dict]:
    """Use Google Gemini to get accurate nutrition information for a food item."""
    
    if not GEMINI_API_KEY:
        return None
    
    serving_info = ""
    if serving_size and serving_unit:
        serving_info = f" for {serving_size} {serving_unit}"
    
    prompt = f"""You are a nutrition database. Provide detailed nutritional information for "{food_name}"{serving_info}.

Respond ONLY with valid JSON in this exact format (no additional text):
{{
    "name": "Food name in English",
    "serving_size": number,
    "serving_unit": "g" or "ml" or "piece",
    "calories": number (kcal),
    "protein": number (grams),
    "carbohydrates": number (grams),
    "fat": number (grams),
    "sugar": number (grams, optional),
    "fiber": number (grams, optional),
    "sodium": number (mg, optional),
    "calcium": number (mg, optional),
    "iron": number (mg, optional)
}}

Use standard USDA nutritional data. If the food is not recognized, return null."""

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        content = response.text.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        nutrition_data = json.loads(content.strip())
        
        if nutrition_data is None:
            return None
            
        nutrition_data["id"] = f"{food_name.lower().replace(' ', '_')}_{random.randint(1000, 9999)}"
        
        return nutrition_data
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    
    try:
        image = Image.open(io.BytesIO(contents))
        image = image.resize((224, 224))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    
    detected_foods = random.sample(FOOD_CLASSES, k=random.randint(2, 4))
    
    foods = []
    for food_key in detected_foods:
        food_data = NUTRITION_DB[food_key].copy()
        portion_multiplier = random.choice([0.8, 1.0, 1.2, 1.5])
        
        for key in ["calories", "protein", "carbohydrates", "fat", "sugar", "fiber"]:
            if food_data.get(key):
                food_data[key] = round(food_data[key] * portion_multiplier, 1)
        
        food_data["id"] = f"{food_key}_{random.randint(1000, 9999)}"
        foods.append(food_data)
    
    totals = {
        "calories": sum(f["calories"] for f in foods),
        "protein": sum(f["protein"] for f in foods),
        "carbohydrates": sum(f["carbohydrates"] for f in foods),
        "fat": sum(f["fat"] for f in foods),
    }
    
    score = "good"
    if totals["calories"] > 800:
        score = "moderate"
    if totals["calories"] > 1200:
        score = "exceed"
    
    recommendations = []
    if totals["protein"] < 20:
        recommendations.append("Consider adding more protein-rich foods like chicken, eggs, or tofu.")
    if totals["carbohydrates"] > 60:
        recommendations.append("This meal is high in carbs. Consider balancing with more vegetables.")
    if totals["fat"] > 25:
        recommendations.append("Consider choosing leaner protein options for this meal.")
    
    return {
        "foods": foods,
        "total": totals,
        "score": score,
        "recommendations": recommendations
    }

@router.get("/search")
async def search_nutrition(
    q: str = Query(..., min_length=1),
    serving_size: Optional[int] = Query(None, description="Serving size"),
    serving_unit: Optional[str] = Query(None, description="Serving unit (g, ml, piece)")
):
    query_lower = q.lower()
    
    try:
        gemini_result = await parse_nutrition_from_gemini(q, serving_size, serving_unit)
        if gemini_result:
            return {"results": [gemini_result], "source": "gemini"}
    except Exception as e:
        print(f"Gemini search error: {e}")
    
    results = []
    for key, data in NUTRITION_DB.items():
        if query_lower in key or query_lower in data["name"].lower():
            results.append(data)
    
    if not results:
        return {"results": [], "message": f"No results found for '{q}'"}
    
    return {"results": results, "source": "local_db"}
