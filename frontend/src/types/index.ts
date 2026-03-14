export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";
  goal: "lose_weight" | "gain_muscle" | "maintain";
  bmi: number;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export interface FoodItem {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  sugar?: number;
  fiber?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
}

export interface Meal {
  id: string;
  userId: string;
  imageUrl?: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  score?: "good" | "moderate" | "exceed";
  createdAt: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealAnalysis {
  foods: FoodItem[];
  total: NutritionSummary;
  score: "good" | "moderate" | "exceed";
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface MealPlan {
  meals: {
    name: string;
    foods: FoodItem[];
    calories: number;
    instructions?: string;
  }[];
  totalCalories: number;
}
