from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Optional, Any, Dict
import random
import io
import json
import os
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_MODEL = "gemini-2.0-flash"

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
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        )
        
        content = response.text.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        nutrition_data = _try_parse_json(content)
        
        if nutrition_data is None:
            return None
            
        return normalize_food_item(nutrition_data, fallback_name=food_name)
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None


def _strip_json_markdown(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    return cleaned.strip()


def _extract_json_object(text: str) -> Optional[str]:
    start = text.find("{")
    if start == -1:
        return None

    depth = 0
    for idx in range(start, len(text)):
        char = text[idx]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start:idx + 1]

    return None


def _try_parse_json(content: str) -> Any:
    cleaned = _strip_json_markdown(content)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        extracted = _extract_json_object(cleaned)
        if not extracted:
            raise
        return json.loads(extracted)


def _to_number(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (ValueError, TypeError):
        return float(default)


def normalize_food_item(raw: Dict[str, Any], fallback_name: str = "Unknown food") -> Dict[str, Any]:
    name = str(raw.get("name") or fallback_name).strip() or fallback_name
    serving_size = _to_number(raw.get("serving_size", raw.get("servingSize", 100)), 100)
    serving_unit = str(raw.get("serving_unit", raw.get("servingUnit", "g")) or "g").strip() or "g"

    item = {
        "id": str(raw.get("id") or f"{name.lower().replace(' ', '_')}_{random.randint(1000, 9999)}"),
        "name": name,
        "servingSize": max(1.0, round(serving_size, 1)),
        "servingUnit": serving_unit,
        "calories": max(0.0, round(_to_number(raw.get("calories")), 1)),
        "protein": max(0.0, round(_to_number(raw.get("protein")), 1)),
        "carbohydrates": max(0.0, round(_to_number(raw.get("carbohydrates")), 1)),
        "fat": max(0.0, round(_to_number(raw.get("fat")), 1)),
    }

    optional_fields = ["sugar", "fiber", "sodium", "calcium", "iron"]
    for field in optional_fields:
        if raw.get(field) is not None:
            item[field] = max(0.0, round(_to_number(raw.get(field)), 1))

    return item


async def analyze_image_with_gemini(image: Image.Image) -> Optional[List[Dict[str, Any]]]:
    if not GEMINI_API_KEY:
        return None

    prompt = """You are a nutrition image analysis assistant.

Task:
1) Identify visible food items in this meal image.
2) Estimate serving size per item.
3) Estimate nutrition per item.

Return ONLY valid JSON in this exact format:
{
  "foods": [
    {
      "name": "food name",
      "serving_size": number,
      "serving_unit": "g" | "ml" | "piece",
      "calories": number,
      "protein": number,
      "carbohydrates": number,
      "fat": number,
      "sugar": number,
      "fiber": number
    }
  ]
}

Rules:
- Include only edible food/drink items.
- Max 8 items.
- If uncertain, use best estimate with realistic values.
- All numeric fields must be non-negative numbers.
- If no food is detected, return {"foods": []}.
"""

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            [prompt, image],
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        )
        parsed = _try_parse_json(response.text)

        if not isinstance(parsed, dict):
            return None

        foods_raw = parsed.get("foods", [])
        if not isinstance(foods_raw, list):
            return None

        foods = [normalize_food_item(item) for item in foods_raw if isinstance(item, dict)]
        return foods[:8]
    except Exception as e:
        print(f"Gemini image analysis error: {e}")
        return None


def build_recommendations(total: Dict[str, float]) -> List[str]:
    recommendations: List[str] = []

    if total["protein"] < 20:
        recommendations.append("Consider adding more lean protein (chicken, fish, eggs, tofu) to improve satiety.")
    if total["carbohydrates"] > 90:
        recommendations.append("This meal is relatively high in carbs. Pair with more non-starchy vegetables.")
    if total["fat"] > 30:
        recommendations.append("Fat content is high; reducing fried items or rich sauces can help balance this meal.")
    if total["fiber"] < 6:
        recommendations.append("Add vegetables, legumes, or whole grains to increase fiber intake.")

    return recommendations

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    foods = await analyze_image_with_gemini(image)
    if foods is None:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=503, detail="AI image analysis is not configured")
        raise HTTPException(status_code=502, detail="AI image analysis failed")

    total = {
        "calories": round(sum(_to_number(f.get("calories")) for f in foods), 1),
        "protein": round(sum(_to_number(f.get("protein")) for f in foods), 1),
        "carbohydrates": round(sum(_to_number(f.get("carbohydrates")) for f in foods), 1),
        "fat": round(sum(_to_number(f.get("fat")) for f in foods), 1),
        "sugar": round(sum(_to_number(f.get("sugar")) for f in foods), 1),
        "fiber": round(sum(_to_number(f.get("fiber")) for f in foods), 1),
    }

    if total["calories"] > 1200:
        score = "exceed"
    elif total["calories"] > 800:
        score = "moderate"
    else:
        score = "good"

    return {
        "foods": foods,
        "total": {
            "calories": total["calories"],
            "protein": total["protein"],
            "carbohydrates": total["carbohydrates"],
            "fat": total["fat"],
        },
        "score": score,
        "recommendations": build_recommendations(total),
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
            normalized = normalize_food_item(
                {
                    "id": key,
                    "name": data["name"],
                    "serving_size": data["serving_size"],
                    "serving_unit": data["serving_unit"],
                    "calories": data["calories"],
                    "protein": data["protein"],
                    "carbohydrates": data["carbohydrates"],
                    "fat": data["fat"],
                    "sugar": data.get("sugar"),
                    "fiber": data.get("fiber"),
                },
                fallback_name=data["name"],
            )
            results.append(normalized)
    
    if not results:
        return {"results": [], "message": f"No results found for '{q}'"}
    
    return {"results": results, "source": "local_db"}
