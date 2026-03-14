"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nutritionAPI } from "@/lib/api";
import { MealPlan } from "@/types";
import { formatCalories, formatMacro } from "@/lib/utils";
import { useUserProfileStore } from "@/stores";
import { Loader2, ChefHat } from "lucide-react";

export default function MealPlannerPage() {
  const { profile } = useUserProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [formData, setFormData] = useState({
    calories: profile?.calorieTarget.toString() || "2000",
    cuisine: "vietnamese",
    mealType: "lunch",
    ingredients: "",
  });

  const generatePlan = async () => {
    setIsLoading(true);
    try {
      const response = await nutritionAPI.getMealPlan({
        calories: parseInt(formData.calories),
        cuisine: formData.cuisine,
        mealType: formData.mealType,
        ingredients: formData.ingredients ? formData.ingredients.split(",").map(i => i.trim()) : [],
      });
      setMealPlan(response.data);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Meal Planner</h1>
        <p className="text-muted-foreground">
          Get personalized meal suggestions based on your goals
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meal Preferences</CardTitle>
            <CardDescription>
              Configure your meal plan preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Target Calories</Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select
                value={formData.mealType}
                onValueChange={(value) => setFormData({ ...formData, mealType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cuisine</Label>
              <Select
                value={formData.cuisine}
                onValueChange={(value) => setFormData({ ...formData, cuisine: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vietnamese">Vietnamese</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="western">Western</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Ingredients (comma-separated)</Label>
              <Input
                placeholder="e.g., chicken, rice, vegetables"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              />
            </div>

            <Button onClick={generatePlan} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ChefHat className="h-4 w-4 mr-2" />
                  Generate Meal Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggested Meals</CardTitle>
            <CardDescription>
              AI-generated meal recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mealPlan ? (
              <div className="space-y-6">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{formatCalories(mealPlan.totalCalories)}</p>
                  <p className="text-sm text-muted-foreground">Total Calories</p>
                </div>

                {mealPlan.meals.map((meal, i) => (
                  <div key={i} className="space-y-3 border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{meal.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatCalories(meal.calories)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      {meal.foods.map((food, j) => (
                        <div key={j} className="flex justify-between">
                          <span className="text-muted-foreground">{food.name}</span>
                          <span>{formatMacro(food.calories)}</span>
                        </div>
                      ))}
                    </div>
                    {meal.instructions && (
                      <p className="text-xs text-muted-foreground">{meal.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your preferences and generate a meal plan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
