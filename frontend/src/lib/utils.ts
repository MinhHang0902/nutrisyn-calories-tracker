import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCalories(calories: number): string {
  return `${formatNumber(Math.round(calories))} kcal`;
}

export function formatMacro(grams: number): string {
  return `${formatNumber(Math.round(grams))}g`;
}

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender.toLowerCase() === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return bmr * (activityMultipliers[activityLevel] || 1.2);
}

export function getProgressColor(current: number, target: number): string {
  const percentage = (current / target) * 100;
  if (percentage >= 90 && percentage <= 110) return "text-green-500";
  if (percentage >= 70 && percentage < 90) return "text-yellow-500";
  if (percentage > 110) return "text-red-500";
  return "text-orange-500";
}
