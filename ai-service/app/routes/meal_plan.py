from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
import random
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_MODEL = "gemini-2.0-flash"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


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


class MealPlanRequest(BaseModel):
    calories: int
    cuisine: Optional[str] = "vietnamese"
    mealType: str
    ingredients: Optional[List[str]] = []


@router.post("/meal-plan")
async def generate_meal_plan(request: MealPlanRequest):
    if not GEMINI_API_KEY:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Gemini API key is not configured")

    ingredients_text = ""
    if request.ingredients:
        ingredients_text = f"\nThe dish should ideally include these ingredients: {', '.join(request.ingredients)}"

    prompt = f"""You are a professional nutritionist and meal planner specializing in {request.cuisine} cuisine.

Suggest exactly 3 different meal options for {request.mealType}, each option being approximately {request.calories} kcal.

Requirements:
- Target per dish: ~{request.calories} kcal
- Cuisine: {request.cuisine}
- Meal type: {request.mealType}
{ingredients_text}

Each dish should be a complete, standalone meal around the calorie target (within ±10-15% tolerance).
Do NOT combine the 3 dishes — they are 3 separate alternatives the user can choose from.

Respond ONLY with valid JSON in this exact format:
{{
  "meals": [
    {{
      "name": "Dish name",
      "foods": [
        {{
          "name": "Specific food item",
          "serving_size": number,
          "serving_unit": "g" or "ml" or "piece",
          "calories": number,
          "protein": number,
          "carbohydrates": number,
          "fat": number
        }}
      ],
      "instructions": "Brief step-by-step cooking instructions in 2-3 sentences"
    }}
  ]
}}

Rules:
- Return exactly 3 meal options
- Each meal's total calories should be approximately {request.calories} kcal (within ±10-15%)
- Use specific food names, not generic terms like "vegetables"
- Protein, carbs, fat must be realistic nutritional estimates in grams
- Instructions should be practical and concise
- Use authentic {request.cuisine} dishes appropriate for {request.mealType}"""

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "response_mime_type": "application/json",
            },
        )
        parsed = _try_parse_json(response.text)

        if not isinstance(parsed, dict) or "meals" not in parsed:
            raise Exception("Invalid response format from Gemini")

        meals_raw = parsed.get("meals", [])
        if not isinstance(meals_raw, list) or len(meals_raw) == 0:
            raise Exception("No meals returned from Gemini")

        meals = []

        for meal_data in meals_raw:
            if not isinstance(meal_data, dict):
                continue

            foods_raw = meal_data.get("foods", [])
            if not isinstance(foods_raw, list):
                continue

            foods = [normalize_food_item(item) for item in foods_raw if isinstance(item, dict)]
            if not foods:
                continue

            meal_calories = sum(f["calories"] for f in foods)

            meals.append({
                "name": meal_data.get("name", "Custom Meal"),
                "foods": foods,
                "calories": round(meal_calories, 1),
                "instructions": meal_data.get("instructions", "Cook and serve."),
            })

        if not meals:
            raise Exception("No valid meals were generated")

        return {
            "meals": meals,
            "cuisine": request.cuisine,
            "mealType": request.mealType,
            "source": "gemini",
        }
    except Exception as e:
        print(f"Gemini meal plan error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=502, detail=f"Meal plan generation failed: {str(e)}")
