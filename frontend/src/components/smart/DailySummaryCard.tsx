"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NutritionGauge } from "./NutritionGauge";
import { formatCalories, formatMacro } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSpring, animated } from "react-spring";
import { Flame, Droplets, Wheat, Circle, Clock } from "lucide-react";
import { format } from "date-fns";

interface DailySummaryCardProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  lastMealTime?: string;
}

export function DailySummaryCard({
  nutrition,
  targets,
  lastMealTime,
}: DailySummaryCardProps) {
  const caloriesRemaining = targets.calories - nutrition.calories;
  const isOverCalories = caloriesRemaining < 0;

  const { animatedCalories } = useSpring({
    animatedCalories: nutrition.calories,
    from: { animatedCalories: 0 },
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const calorieProgress = targets.calories > 0 
    ? Math.min((nutrition.calories / targets.calories) * 100, 100)
    : 0;

  const getStatus = () => {
    if (isOverCalories) return { label: "Over Target", color: "text-red-500" };
    if (calorieProgress >= 90) return { label: "Almost There", color: "text-green-500" };
    if (calorieProgress >= 50) return { label: "On Track", color: "text-blue-500" };
    return { label: "Just Started", color: "text-yellow-500" };
  };

  const status = getStatus();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Summary
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(new Date(), "MMM dd, yyyy")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <animated.span className="text-3xl font-bold">
                {animatedCalories.to((n) => Math.round(n))}
              </animated.span>
              <span className="text-muted-foreground">/ {targets.calories} kcal</span>
            </div>
            <p className={cn("text-sm font-medium", status.color)}>
              {isOverCalories 
                ? `${Math.abs(caloriesRemaining)} kcal over` 
                : `${caloriesRemaining} kcal remaining`}
            </p>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-medium", status.color)}>{status.label}</p>
          </div>
        </div>

        <Progress 
          value={calorieProgress} 
          className={cn(
            "h-3",
            isOverCalories && "[&>div]:bg-red-500"
          )}
        />

        <div className="grid grid-cols-4 gap-2 pt-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <Droplets className="h-4 w-4 text-blue-500 mb-1" />
            <span className="text-xs text-muted-foreground">Protein</span>
            <span className="font-semibold text-sm">{formatMacro(nutrition.protein)}g</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
            <Wheat className="h-4 w-4 text-green-500 mb-1" />
            <span className="text-xs text-muted-foreground">Carbs</span>
            <span className="font-semibold text-sm">{formatMacro(nutrition.carbs)}g</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <Circle className="h-4 w-4 text-yellow-500 mb-1" />
            <span className="text-xs text-muted-foreground">Fat</span>
            <span className="font-semibold text-sm">{formatMacro(nutrition.fat)}g</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
            <Flame className="h-4 w-4 text-purple-500 mb-1" />
            <span className="text-xs text-muted-foreground">Left</span>
            <span className="font-semibold text-sm">
              {Math.max(0, caloriesRemaining)}
            </span>
          </div>
        </div>

        {lastMealTime && (
          <p className="text-xs text-muted-foreground text-center">
            Last meal: {format(new Date(lastMealTime), "h:mm a")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
