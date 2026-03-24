from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

from app.routes import nutrition, chat, meal_plan

GEMINI_MODEL = "gemini-2.0-flash"

app = FastAPI(
    title="NutriSyn AI Service",
    description="AI-powered nutrition analysis and meal planning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nutrition.router, prefix="/api", tags=["Nutrition"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(meal_plan.router, prefix="/api", tags=["Meal Plan"])

@app.get("/")
async def root():
    return {"message": "NutriSyn AI Service is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    gemini_status = "configured" if gemini_key else "not configured"
    
    return {
        "status": "healthy",
        "gemini_api": gemini_status
    }

@app.get("/test-gemini")
async def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY", "")
    
    if not api_key:
        return {"status": "error", "message": "Gemini API key not found"}
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content("Say OK if you receive this")
        return {"status": "success", "message": response.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
