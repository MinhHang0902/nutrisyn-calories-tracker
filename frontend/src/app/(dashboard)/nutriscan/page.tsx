"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { nutritionAPI, mealAPI } from "@/lib/api";
import { MealAnalysis } from "@/types";
import { formatCalories, formatMacro, cn } from "@/lib/utils";
import { useUserProfileStore } from "@/stores";
import { Upload, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function NutriScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const { profile, todayNutrition, updateTodayNutrition } = useUserProfileStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setAnalysis(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "video/*": [".mp4", ".webm"],
    },
    maxFiles: 1,
  });

  const analyzeImage = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await nutritionAPI.analyzeImage(formData);
      setAnalysis(response.data);
      toast.success("Analysis complete!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!analysis) return;

    try {
      const formData = new FormData();
      if (file) formData.append("image", file);
      formData.append("foods", JSON.stringify(analysis.foods));
      formData.append("mealType", "lunch");
      formData.append("score", analysis.score);

      await mealAPI.createMeal(formData);
      updateTodayNutrition({
        calories: todayNutrition.calories + analysis.total.calories,
        protein: todayNutrition.protein + analysis.total.protein,
        carbs: todayNutrition.carbs + analysis.total.carbs,
        fat: todayNutrition.fat + analysis.total.fat,
      });
      toast.success("Meal saved successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save meal");
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case "good":
        return "text-green-500";
      case "moderate":
        return "text-yellow-500";
      case "exceed":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case "good":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "moderate":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "exceed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI NutriScan</h1>
        <p className="text-muted-foreground">
          Upload a photo of your meal to analyze its nutritional content
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Meal</CardTitle>
            <CardDescription>
              Drag and drop or click to upload an image or video of your meal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                image && "border-solid"
              )}
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="relative aspect-video">
                  <Image
                    src={image}
                    alt="Uploaded meal"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {isDragActive
                        ? "Drop the file here"
                        : "Click or drag to upload"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, WebP, MP4, WebM
                    </p>
                  </div>
                </div>
              )}
            </div>

            {image && (
              <div className="mt-4 flex gap-2">
                <Button onClick={analyzeImage} disabled={isAnalyzing} className="flex-1">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Meal"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImage(null);
                    setFile(null);
                    setAnalysis(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Nutritional breakdown of your meal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                {/* Score Badge */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  {getScoreIcon(analysis.score)}
                  <div>
                    <p className="font-medium capitalize">{analysis.score}</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.score === "good"
                        ? "This meal fits your nutritional goals"
                        : analysis.score === "moderate"
                        ? "Consider adjusting portion sizes"
                        : "This meal exceeds your targets"}
                    </p>
                  </div>
                </div>

                {/* Total Nutrition */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Calories</span>
                    <span className="font-medium">
                      {formatCalories(analysis.total.calories)}
                    </span>
                  </div>
                  <Progress
                    value={
                      profile
                        ? (analysis.total.calories / profile.calorieTarget) * 100
                        : 0
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{formatMacro(analysis.total.protein)}</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{formatMacro(analysis.total.carbs)}</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{formatMacro(analysis.total.fat)}</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>

                {/* Food Items */}
                <div className="space-y-2">
                  <h4 className="font-medium">Food Items</h4>
                  {analysis.foods.map((food, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm border-b py-2"
                    >
                      <span>{food.name}</span>
                      <span className="text-muted-foreground">
                        {formatCalories(food.calories)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="text-sm space-y-1">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-muted-foreground">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={saveMeal} className="w-full">
                  Save Meal
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Upload an image and click &quot;Analyze&quot; to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
