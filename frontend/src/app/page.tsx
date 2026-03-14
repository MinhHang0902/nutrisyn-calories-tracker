import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Camera, 
  Search, 
  CalendarDays, 
  Calculator, 
  MessageSquare, 
  History,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">NutriSyn</span>
          </div>
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Smart Nutrition, <span className="text-primary">AI Powered</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track your meals with AI-powered image recognition, get personalized 
            nutrition advice, and achieve your health goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-to-use">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for Better Nutrition
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Camera className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI NutriScan</CardTitle>
                <CardDescription>
                  Upload a photo of your meal and get instant nutritional analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our AI identifies food items and calculates calories, protein, carbs, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Nutrition Finder</CardTitle>
                <CardDescription>
                  Search for any food and get detailed nutritional information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Look up nutrition facts for thousands of foods with portion sizes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CalendarDays className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Meal Planner</CardTitle>
                <CardDescription>
                  Get AI-generated meal plans based on your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Personalized daily menus that fit your dietary preferences and objectives.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calculator className="h-10 w-10 text-primary mb-2" />
                <CardTitle>BMI Calculator</CardTitle>
                <CardDescription>
                  Calculate your BMI, BMR, and TDEE instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Understand your body metrics and set realistic health goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Chat Advisor</CardTitle>
                <CardDescription>
                  Get personalized nutrition advice through chat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ask questions and receive contextual, personalized recommendations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <History className="h-10 w-10 text-primary mb-2" />
                <CardTitle>History & Analytics</CardTitle>
                <CardDescription>
                  Track your progress with detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View meal history, trends, and progress towards your goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of users who have already improved their health with NutriSyn.
          </p>
          <Link href="/register">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 NutriSyn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
