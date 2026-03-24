from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", GEMINI_MODEL)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    message: str
    timestamp: str

SYSTEM_PROMPT = """You are NutriSyn AI, a professional nutrition advisor. Your role is to provide helpful, accurate information about nutrition and healthy eating.

 Guidelines:
- Provide evidence-based nutrition information
- Always consider the user's personal context (calories, macros, goals)
- Recommend consulting healthcare professionals for personalized medical advice
- Be encouraging and supportive
- Use clear, easy-to-understand language
- Include specific food examples when relevant

 Topics you can help with:
- Calorie counting and macro tracking
- Weight management (loss, gain, maintenance)
- Protein, carbs, and fat balance
- Meal planning and preparation
- Food nutrition facts
- Healthy eating habits
- Understanding food labels

 Always be helpful, accurate, and prioritize the user's health and goals."""

def build_prompt(user_message: str, context: Optional[Dict[str, Any]] = None, history: Optional[List[ChatMessage]] = None) -> str:
    prompt = SYSTEM_PROMPT + "\n\n"
    
    if context:
        try:
            calorie_target = int(float(context.get("calorieTarget") or 0))
            today_calories = int(float(context.get("todayCalories") or 0))
            today_protein = int(float(context.get("todayProtein") or 0))
            today_carbs = int(float(context.get("todayCarbs") or 0))
            today_fat = int(float(context.get("todayFat") or 0))
            goal = str(context.get("goal") or "")
        except (ValueError, TypeError):
            calorie_target = 0
            today_calories = 0
            today_protein = 0
            today_carbs = 0
            today_fat = 0
            goal = ""
        
        prompt += f"\n📊 USER'S CURRENT CONTEXT:\n"
        if calorie_target > 0:
            remaining = calorie_target - today_calories
            prompt += f"- Daily Calorie Target: {calorie_target} kcal\n"
            prompt += f"- Calories Consumed Today: {today_calories} kcal\n"
            prompt += f"- Remaining Calories: {remaining} kcal\n"
        prompt += f"- Protein Today: {today_protein}g\n"
        prompt += f"- Carbs Today: {today_carbs}g\n"
        prompt += f"- Fat Today: {today_fat}g\n"
        if goal:
            prompt += f"- User's Goal: {goal}\n"
        prompt += "\n"
    
    if history:
        prompt += "\n📝 CONVERSATION HISTORY:\n"
        for msg in history[-5:]:
            role = "User" if msg.role == "user" else "Assistant"
            prompt += f"{role}: {msg.content}\n"
        prompt += "\n"
    
    prompt += f"\n💬 USER QUESTION: {user_message}\n"
    prompt += "\nPlease provide a helpful, personalized response:"
    
    return prompt

async def generate_response(user_message: str, context: Optional[Dict[str, Any]] = None, history: Optional[List[ChatMessage]] = None) -> str:
    if not GEMINI_API_KEY:
        return generate_fallback_response(user_message, context)
    
    try:
        prompt = build_prompt(user_message, context, history)
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 1000,
            }
        )
        
        return response.text.strip()
        
    except Exception as e:
        print(f"Gemini chat error: {e}")
        return generate_fallback_response(user_message, context)

def generate_fallback_response(user_message: str, context: Optional[Dict[str, Any]] = None) -> str:
    message_lower = user_message.lower()
    
    calorie_info = ""
    if context:
        try:
            calorie_target = int(float(context.get("calorieTarget") or 0))
            today_calories = int(float(context.get("todayCalories") or 0))
        except (ValueError, TypeError):
            calorie_target = 0
            today_calories = 0
        
        if calorie_target > 0:
            remaining = calorie_target - today_calories
            calorie_info = f"\n\n📊 Today's Progress: {today_calories}/{calorie_target} kcal ({remaining} remaining)"
    
    if "protein" in message_lower:
        return f"""🥩 Protein is essential for muscle building and repair.

**Protein Recommendations:**
- For weight loss: 1.6-2.2g per kg body weight
- For muscle gain: 1.6-2.2g per kg body weight

**Good protein sources:**
- Chicken breast, turkey, fish
- Eggs, Greek yogurt
- Tofu, tempeh, legumes
- Nuts and seeds{calorie_info}"""

    elif "calorie" in message_lower or "weight" in message_lower:
        return f"""⚖️ Calories and weight management:

**Basic concept:**
- 1 lb of fat ≈ 3,500 calories
- To lose 0.5kg/week: create ~500 calorie deficit daily
- To gain 0.5kg/week: create ~500 calorie surplus daily{calorie_info}

Would you like me to calculate your specific calorie needs?"""

    elif "lose weight" in message_lower or "giảm cân" in message_lower:
        return f"""📉 Tips for healthy weight loss:

1. **Create a calorie deficit** - 300-500 calories below TDEE
2. **Eat more protein** - Keeps you full, preserves muscle
3. **Increase fiber** - Vegetables, fruits, whole grains
4. **Stay hydrated** - Drink 2-3L water daily
5. **Exercise** - Both cardio and strength training
6. **Get enough sleep** - 7-9 hours per night{calorie_info}

Would you like me to calculate your calorie target?"""

    elif "gain muscle" in message_lower or "tăng cơ" in message_lower:
        return f"""💪 Tips for muscle gain:

1. **Eat protein surplus** - 1.6-2.2g per kg body weight
2. **Complex carbs** - Fuel your workouts
3. **Strength training** - Progressive overload
4. **Rest & recovery** - Muscles grow during rest
5. **Eat frequently** - 4-6 meals per day{calorie_info}

Would you like me to calculate your protein target?"""

    else:
        return f"""I'm here to help with your nutrition questions! 

You can ask me about:
- Protein, carbs, and fats
- Calorie counting
- Weight loss or gain
- Meal planning
- Food nutrition
- Healthy eating habits

{calorie_info}

What would you like to know?"""


@router.post("/chat")
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    response = await generate_response(request.message, request.context, request.history)
    
    return {
        "message": response
    }
