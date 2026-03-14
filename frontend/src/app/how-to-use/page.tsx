"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Camera, Search, CalendarDays, Calculator, MessageSquare, User, Sparkles } from "lucide-react";

export default function HowToUsePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">NutriSyn</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/how-to-use" className="text-sm font-medium hover:text-primary">
              How to Use
            </Link>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">How to Use NutriSyn</h1>
          <p className="text-center text-muted-foreground mb-12">
            Follow this guide to get started with your nutrition journey
          </p>

          <div className="space-y-8">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Sign up to save your data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">
                    Click &quot;Get Started&quot; on the homepage, fill in your email and password.
                    After registering, complete your profile with your age, weight, height, and health goals.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <CardTitle>Set Your Nutrition Goals</CardTitle>
                    <CardDescription>Get personalized targets</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Calculator className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">
                    Visit the BMI Calculator page to calculate your BMI, BMR, and TDEE.
                    Based on your goals (lose weight, maintain, or gain muscle), 
                    we&apos;ll set your daily calorie and macro targets.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    3
                  </div>
                  <div>
                    <CardTitle>Scan Your Meals</CardTitle>
                    <CardDescription>AI analyzes your food</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">
                    Go to NutriScan and upload a photo of your meal.
                    Our AI will identify the food items and calculate nutritional values.
                    Review and save the meal to track your daily intake.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    4
                  </div>
                  <div>
                    <CardTitle>Track Your Progress</CardTitle>
                    <CardDescription>Monitor your daily nutrition</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">
                    Check your Dashboard to see daily progress.
                    The progress bars show calories and macros consumed vs. your targets.
                    View History to analyze your eating patterns over time.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 5 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    5
                  </div>
                  <div>
                    <CardTitle>Get AI Advice</CardTitle>
                    <CardDescription>Chat with nutrition expert</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">
                    Use the Chat feature to ask questions about nutrition.
                    Get personalized recommendations based on your profile and eating history.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 6 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    6
                  </div>
                  <div>
                    <CardTitle>Plan Your Meals</CardTitle>
                    <CardDescription>Get AI-generated meal plans</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">
                    Use Meal Planner to get AI-suggested meals.
                    Specify your calorie target, cuisine preference, and dietary restrictions.
                    Get complete recipes with nutritional information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
