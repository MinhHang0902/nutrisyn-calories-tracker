"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileAPI } from "@/lib/api";
import { useUserProfileStore } from "@/stores";
import { User, ArrowRight, Loader2, Target, Scale, Ruler, Activity, Edit, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProfileData {
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";
  goal: "lose_weight" | "gain_muscle" | "maintain";
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { profile, setProfile } = useUserProfileStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const [results, setResults] = useState<{
    bmi: number;
    bmr: number;
    tdee: number;
    calorieTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
  } | null>(null);

  const [formData, setFormData] = useState<ProfileData>({
    age: 25,
    gender: "male",
    height: 170,
    weight: 70,
    activityLevel: "moderately_active",
    goal: "maintain",
  });

  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const res = await profileAPI.getProfile();
        if (res.data && res.data.age && res.data.height && res.data.weight) {
          setProfile(res.data);
          setHasProfile(true);
          // Load existing data into form
          setFormData({
            age: res.data.age || 25,
            gender: res.data.gender || "male",
            height: res.data.height || 170,
            weight: res.data.weight || 70,
            activityLevel: res.data.activityLevel || "moderately_active",
            goal: res.data.goal || "maintain",
          });
          setResults({
            bmi: res.data.bmi || 0,
            bmr: res.data.bmr || 0,
            tdee: res.data.tdee || 0,
            calorieTarget: res.data.calorieTarget || 0,
            proteinTarget: res.data.proteinTarget || 0,
            carbsTarget: res.data.carbsTarget || 0,
            fatTarget: res.data.fatTarget || 0,
          });
        }
      } catch (error) {
        // No profile exists yet
        setHasProfile(false);
      } finally {
        setInitialLoading(false);
      }
    };
    checkExistingProfile();
  }, []);

  const calculateMetrics = async () => {
    setCalculating(true);
    try {
      const res = await profileAPI.updateBodyMetrics(formData);
      setResults(res.data);
      setStep(2);
      toast.success("Calculated your nutrition targets!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to calculate");
    } finally {
      setCalculating(false);
    }
  };

  const saveProfile = async () => {
    if (!results) return;
    setLoading(true);
    try {
      await profileAPI.updateBodyMetrics(formData);
      setProfile({ ...formData, ...results } as any);
      setHasProfile(true);
      setShowEditForm(false);
      toast.success(isEditMode ? "Profile updated successfully!" : "Profile saved successfully!");
      router.push("/profile-setup");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-yellow-500" };
    if (bmi < 25) return { label: "Normal", color: "text-green-500" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-red-500" };
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case "lose_weight": return "Lose Weight";
      case "gain_muscle": return "Gain Muscle";
      case "maintain": return "Maintain Weight";
      default: return goal;
    }
  };

  const getActivityLabel = (activity: string) => {
    switch (activity) {
      case "sedentary": return "Sedentary (little or no exercise)";
      case "lightly_active": return "Lightly Active (1-3 days/week)";
      case "moderately_active": return "Moderately Active (3-5 days/week)";
      case "very_active": return "Very Active (6-7 days/week)";
      case "extra_active": return "Extra Active (physical job/training)";
      default: return activity;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no profile exists, show first time setup form
  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to NutriSyn!</h1>
            <p className="text-muted-foreground">
              Let's set up your personalized nutrition plan
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm hidden sm:inline">Your Info</span>
            </div>
            <div className="h-px w-12 bg-border self-center" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-primary/10" : "bg-muted"}`}>
                2
              </div>
              <span className="text-sm hidden sm:inline">Your Targets</span>
            </div>
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Tell us about yourself
                  </CardTitle>
                  <CardDescription>
                    We'll calculate your personalized nutrition targets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: "male" | "female") => 
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min={15}
                      max={100}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    />
                  </div>

                  {/* Height & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Height (cm)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        min={100}
                        max={250}
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        min={30}
                        max={300}
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-2">
                    <Label>Activity Level</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value: any) => setFormData({ ...formData, activityLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                        <SelectItem value="extra_active">Extra Active (physical job/training)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Goal */}
                  <div className="space-y-2">
                    <Label>Your Goal</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value: any) => setFormData({ ...formData, goal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose_weight">Lose Weight</SelectItem>
                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                        <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={calculateMetrics} 
                    disabled={calculating}
                    className="w-full"
                  >
                    {calculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        Calculate My Targets
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && results && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your Personalized Targets
                  </CardTitle>
                  <CardDescription>
                    Based on your information and goal: <span className="font-medium text-primary">{getGoalLabel(formData.goal)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* BMI Result */}
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Your BMI</p>
                        <p className="text-3xl font-bold">{Number(results.bmi).toFixed(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getBMICategory(Number(results.bmi)).color}`}>
                          {getBMICategory(Number(results.bmi)).label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Daily Targets */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border">
                      <p className="text-sm text-muted-foreground">Daily Calories</p>
                      <p className="text-2xl font-bold text-primary">{results.calorieTarget}</p>
                      <p className="text-xs text-muted-foreground">kcal/day</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">BMR</p>
                      <p className="text-2xl font-bold">{results.bmr}</p>
                      <p className="text-xs text-muted-foreground">kcal/day</p>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="space-y-3">
                    <p className="font-medium">Daily Macro Targets</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                        <p className="text-lg font-bold text-blue-600">{results.proteinTarget}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                        <p className="text-lg font-bold text-green-600">{results.carbsTarget}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-center">
                        <p className="text-lg font-bold text-yellow-600">{results.fatTarget}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      onClick={saveProfile} 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Start My Journey"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Show profile info (when profile exists and not in edit mode)
  if (hasProfile && !showEditForm) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Your personalized nutrition information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Body Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Body Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">Age</span>
                </div>
                <p className="text-xl font-bold">{formData.age} years</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Ruler className="h-4 w-4" />
                  <span className="text-xs">Height</span>
                </div>
                <p className="text-xl font-bold">{formData.height} cm</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Scale className="h-4 w-4" />
                  <span className="text-xs">Weight</span>
                </div>
                <p className="text-xl font-bold">{formData.weight} kg</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Goal</span>
                </div>
                <p className="text-xl font-bold">{getGoalLabel(formData.goal)}</p>
              </div>
            </div>

            {/* Activity Level */}
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Activity Level</p>
              <p className="font-medium">{getActivityLabel(formData.activityLevel)}</p>
            </div>

            {/* BMI */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Your BMI</p>
                  <p className="text-3xl font-bold">{Number(results?.bmi || 0).toFixed(1)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getBMICategory(Number(results?.bmi) || 0).color}`}>
                    {getBMICategory(Number(results?.bmi) || 0).label}
                  </p>
                </div>
              </div>
            </div>

            {/* Targets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border">
                <p className="text-sm text-muted-foreground">Daily Calories</p>
                <p className="text-2xl font-bold text-primary">{results?.calorieTarget}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">BMR</p>
                <p className="text-2xl font-bold">{results?.bmr}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
            </div>

            {/* Macros */}
            <div className="space-y-3">
              <p className="font-medium">Daily Macro Targets</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                  <p className="text-lg font-bold text-blue-600">{results?.proteinTarget}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                  <p className="text-lg font-bold text-green-600">{results?.carbsTarget}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-center">
                  <p className="text-lg font-bold text-yellow-600">{results?.fatTarget}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowEditForm(true)} className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show edit form (when has profile and is in edit mode)
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Update Your Profile</h1>
          <p className="text-muted-foreground">
            Update your information to recalculate your nutrition targets
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="text-sm hidden sm:inline">Your Info</span>
          </div>
          <div className="h-px w-12 bg-border self-center" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-primary/10" : "bg-muted"}`}>
              2
            </div>
            <span className="text-sm hidden sm:inline">Your Targets</span>
          </div>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tell us about yourself
                </CardTitle>
                <CardDescription>
                  We'll calculate your personalized nutrition targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: "male" | "female") => 
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={15}
                    max={100}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      min={100}
                      max={250}
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      min={30}
                      max={300}
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select
                    value={formData.activityLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, activityLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extra_active">Extra Active (physical job/training)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Goal */}
                <div className="space-y-2">
                  <Label>Your Goal</Label>
                  <Select
                    value={formData.goal}
                    onValueChange={(value: any) => setFormData({ ...formData, goal: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">Lose Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                      <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateMetrics} 
                  disabled={calculating}
                  className="w-full"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      Calculate My Targets
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && results && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Personalized Targets
                </CardTitle>
                <CardDescription>
                  Based on your information and goal: <span className="font-medium text-primary">{getGoalLabel(formData.goal)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* BMI Result */}
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Your BMI</p>
                      <p className="text-3xl font-bold">{Number(results.bmi).toFixed(1)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getBMICategory(Number(results.bmi)).color}`}>
                        {getBMICategory(Number(results.bmi)).label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daily Targets */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/5 border">
                    <p className="text-sm text-muted-foreground">Daily Calories</p>
                    <p className="text-2xl font-bold text-primary">{results.calorieTarget}</p>
                    <p className="text-xs text-muted-foreground">kcal/day</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">BMR</p>
                    <p className="text-2xl font-bold">{results.bmr}</p>
                    <p className="text-xs text-muted-foreground">kcal/day</p>
                  </div>
                </div>

                {/* Macros */}
                <div className="space-y-3">
                  <p className="font-medium">Daily Macro Targets</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                      <p className="text-lg font-bold text-blue-600">{results.proteinTarget}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                      <p className="text-lg font-bold text-green-600">{results.carbsTarget}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-center">
                      <p className="text-lg font-bold text-yellow-600">{results.fatTarget}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={saveProfile} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
