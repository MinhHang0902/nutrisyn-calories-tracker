"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, formatNumber } from "@/lib/utils";
import { Calculator, Activity, Flame, TrendingUp } from "lucide-react";

export default function BMICalculatorPage() {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activityLevel: "sedentary",
  });
  const [results, setResults] = useState<{
    bmi: number;
    category: string;
    bmr: number;
    tdee: number;
  } | null>(null);

  const calculate = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);

    if (!weight || !height || !age) return;

    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR(weight, height, age, formData.gender);
    const tdee = calculateTDEE(bmr, formData.activityLevel);

    setResults({
      bmi,
      category: getBMICategory(bmi),
      bmr,
      tdee,
    });
  };

  const getBMIColor = (category: string) => {
    switch (category) {
      case "Underweight":
        return "text-blue-500";
      case "Normal":
        return "text-green-500";
      case "Overweight":
        return "text-yellow-500";
      case "Obese":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">BMI Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your BMI, BMR, and TDEE metrics
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Input Your Data
            </CardTitle>
            <CardDescription>
              Enter your body metrics to calculate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="extra_active">Extra Active (very hard exercise)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculate} className="w-full">
              Calculate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Your calculated metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                {/* BMI */}
                <div className="text-center p-6 rounded-lg bg-muted">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">BMI</span>
                  </div>
                  <p className="text-4xl font-bold">{formatNumber(Number(results.bmi.toFixed(1)))}</p>
                  <p className={`text-lg font-medium mt-2 ${getBMIColor(results.category)}`}>
                    {results.category}
                  </p>
                </div>

                {/* BMR & TDEE */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Flame className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(Math.round(results.bmr))}</p>
                    <p className="text-xs text-muted-foreground">BMR (kcal/day)</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatNumber(Math.round(results.tdee))}</p>
                    <p className="text-xs text-muted-foreground">TDEE (kcal/day)</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">Daily Calorie Recommendations:</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Weight Loss: {formatNumber(Math.round(results.tdee - 500))} kcal/day</p>
                    <p>• Maintain: {formatNumber(Math.round(results.tdee))} kcal/day</p>
                    <p>• Gain Weight: {formatNumber(Math.round(results.tdee + 500))} kcal/day</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your data and click Calculate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
