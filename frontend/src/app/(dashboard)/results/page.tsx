"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Camera } from "lucide-react";

function ResultsContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get("score") || "good";
  const calories = searchParams.get("calories") || "0";
  const protein = searchParams.get("protein") || "0";
  const carbs = searchParams.get("carbs") || "0";
  const fat = searchParams.get("fat") || "0";

  const getScoreInfo = () => {
    switch (score) {
      case "good":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Great Choice!",
          description: "This meal fits well within your nutritional goals.",
          color: "bg-green-50 dark:bg-green-950",
        };
      case "moderate":
        return {
          icon: <AlertTriangle className="h-16 w-16 text-yellow-500" />,
          title: "Moderate",
          description: "This meal is somewhat high. Consider adjusting portion sizes.",
          color: "bg-yellow-50 dark:bg-yellow-950",
        };
      case "exceed":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Over Limit",
          description: "This meal exceeds your targets. Balance with lighter meals.",
          color: "bg-red-50 dark:bg-red-950",
        };
      default:
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Good",
          description: "This meal is within your targets.",
          color: "bg-green-50 dark:bg-green-950",
        };
    }
  };

  const scoreInfo = getScoreInfo();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/nutriscan">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to NutriScan
          </Button>
        </Link>

        <Card className={scoreInfo.color}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{scoreInfo.icon}</div>
            <CardTitle className="text-3xl">{scoreInfo.title}</CardTitle>
            <CardDescription className="text-base">
              {scoreInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-3xl font-bold">{calories}</p>
                <p className="text-sm text-muted-foreground">Calories</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-3xl font-bold">{protein}g</p>
                <p className="text-sm text-muted-foreground">Protein</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-3xl font-bold">{carbs}g</p>
                <p className="text-sm text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-3xl font-bold">{fat}g</p>
                <p className="text-sm text-muted-foreground">Fat</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </Link>
              <Link href="/nutriscan" className="flex-1">
                <Button className="w-full gap-2">
                  <Camera className="h-4 w-4" />
                  Scan Another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-12" />}>
      <ResultsContent />
    </Suspense>
  );
}
