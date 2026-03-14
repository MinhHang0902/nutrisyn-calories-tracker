"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserProfileStore } from "@/stores";
import { nutritionAPI, mealAPI, profileAPI } from "@/lib/api";
import { formatCalories, formatMacro } from "@/lib/utils";
import { Camera, Search, CalendarDays, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  DailySummaryCard,
  SmartAlert,
  MealRecommendation,
  WeightTracker,
  NutritionGoals,
  NutritionGauge,
} from "@/components/smart";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, todayNutrition, updateTodayNutrition, setProfile, updateProfile } = useUserProfileStore();
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [lastMealTime, setLastMealTime] = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    try {
      if (!profile) {
        try {
          const profileRes = await profileAPI.getProfile();
          if (profileRes.data && profileRes.data.age) {
            setProfile(profileRes.data);
          }
        } catch {
          // Profile not set
        }
      }

      const mealsRes = await mealAPI.getMeals();
      const meals = mealsRes.data || [];
      setRecentMeals(meals.slice(0, 5));

      if (meals.length > 0) {
        setLastMealTime(meals[0].createdAt);
      }

      const today = new Date().toISOString().split("T")[0];
      const todayMeals = meals.filter((meal: any) => 
        meal.createdAt && meal.createdAt.startsWith(today)
      );

      const totals = todayMeals.reduce(
        (acc: any, meal: any) => ({
          calories: acc.calories + (meal.totalCalories || 0),
          protein: acc.protein + (meal.totalProtein || 0),
          carbs: acc.carbs + (meal.totalCarbs || 0),
          fat: acc.fat + (meal.totalFat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      updateTodayNutrition(totals);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [profile, setProfile, updateTodayNutrition]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calorieProgress = profile
    ? (todayNutrition.calories / profile.calorieTarget) * 100
    : 0;

  const targets = profile
    ? {
        calories: profile.calorieTarget,
        protein: profile.proteinTarget,
        carbs: profile.carbsTarget,
        fat: profile.fatTarget,
      }
    : { calories: 2000, protein: 50, carbs: 250, fat: 65 };

  const nutrition = {
    calories: todayNutrition.calories,
    protein: todayNutrition.protein,
    carbs: todayNutrition.carbs,
    fat: todayNutrition.fat,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!loading && !profile && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold mb-1">Set Up Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile to get personalized nutrition targets and recommendations.
                </p>
                <div className="flex gap-3 justify-center md:justify-start">
                  <Link href="/profile-setup">
                    <Button>Set Up Now</Button>
                  </Link>
                  <Link href="/nutriscan">
                    <Button variant="outline">Skip for Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your nutrition overview.
          </p>
        </div>
        {profile && (
          <Link href="/nutriscan">
            <Button className="gap-2">
              <Camera className="h-4 w-4" />
              Scan Meal
            </Button>
          </Link>
        )}
      </div>

      {profile && showRecommendation && (
        <MealRecommendation
          nutrition={nutrition}
          targets={targets}
          onDismiss={() => setShowRecommendation(false)}
        />
      )}

      <DailySummaryCard
        nutrition={nutrition}
        targets={targets}
        lastMealTime={lastMealTime}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <NutritionGoals
          targets={targets}
          onUpdate={(newTargets) => {
            updateProfile({
              calorieTarget: newTargets.calorieTarget,
              proteinTarget: newTargets.proteinTarget,
              carbsTarget: newTargets.carbsTarget,
              fatTarget: newTargets.fatTarget,
            });
          }}
        />

        <WeightTracker
          currentWeight={profile?.weight}
          goalWeight={
            profile?.goal === "lose_weight"
              ? profile.weight - 5
              : profile?.goal === "gain_muscle"
              ? profile.weight + 3
              : undefined
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress Tracker</CardTitle>
          <CardDescription>Track your daily macro intake</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Calories</span>
                <span className="text-muted-foreground">
                  {formatCalories(todayNutrition.calories)} / {formatCalories(targets.calories)} kcal
                </span>
              </div>
              <Progress 
                value={Math.min(calorieProgress, 100)} 
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-4 justify-items-center pt-2">
              <NutritionGauge
                label="Protein"
                current={nutrition.protein}
                target={targets.protein}
                unit="g"
                color="protein"
                size="md"
              />
              <NutritionGauge
                label="Carbs"
                current={nutrition.carbs}
                target={targets.carbs}
                unit="g"
                color="carbs"
                size="md"
              />
              <NutritionGauge
                label="Fat"
                current={nutrition.fat}
                target={targets.fat}
                unit="g"
                color="fat"
                size="md"
              />
              <NutritionGauge
                label="Calories"
                current={nutrition.calories}
                target={targets.calories}
                unit="kcal"
                color="calories"
                size="md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Meals</CardTitle>
          <CardDescription>Your meals from today</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMeals.length > 0 ? (
            <div className="space-y-4">
              {recentMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium capitalize">{meal.mealType}</p>
                    <p className="text-sm text-muted-foreground">
                      {meal.foods?.map((f: any) => f.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCalories(meal.totalCalories)}</p>
                    <p className="text-sm text-muted-foreground">
                      {meal.score === "good"
                        ? "Good"
                        : meal.score === "moderate"
                        ? "Moderate"
                        : "Exceeds"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No meals recorded today. Start by scanning your first meal!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
