"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Target, Flame, Droplets, Wheat, Circle, Edit2, Save } from "lucide-react";
import { toast } from "sonner";
import { profileAPI } from "@/lib/api";
import { useUserProfileStore } from "@/stores";
import { motion } from "framer-motion";

interface NutritionGoalsProps {
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onUpdate?: (targets: any) => void;
}

export function NutritionGoals({ targets, onUpdate }: NutritionGoalsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, setProfile } = useUserProfileStore();
  const [formData, setFormData] = useState({
    calorieTarget: targets.calories,
    proteinTarget: targets.protein,
    carbsTarget: targets.carbs,
    fatTarget: targets.fat,
  });

  useEffect(() => {
    setFormData({
      calorieTarget: targets.calories,
      proteinTarget: targets.protein,
      carbsTarget: targets.carbs,
      fatTarget: targets.fat,
    });
  }, [targets]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (profile) {
        await profileAPI.updateBodyMetrics({
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          activityLevel: profile.activityLevel,
          goal: profile.goal,
        });
        
        setProfile({
          ...profile,
          calorieTarget: formData.calorieTarget,
          proteinTarget: formData.proteinTarget,
          carbsTarget: formData.carbsTarget,
          fatTarget: formData.fatTarget,
        });
        
        onUpdate?.(formData);
        toast.success("Nutrition goals updated!");
        setIsEditOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update goals");
    } finally {
      setIsLoading(false);
    }
  };

  const macroItems = [
    { key: "calorieTarget", label: "Calories", icon: Flame, color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/20", unit: "kcal" },
    { key: "proteinTarget", label: "Protein", icon: Droplets, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/20", unit: "g" },
    { key: "carbsTarget", label: "Carbs", icon: Wheat, color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-950/20", unit: "g" },
    { key: "fatTarget", label: "Fat", icon: Circle, color: "text-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/20", unit: "g" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Nutrition Goals
          </CardTitle>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Daily Nutrition Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {macroItems.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label htmlFor={item.key} className="flex items-center gap-2">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      {item.label} ({item.unit})
                    </Label>
                    <Input
                      id={item.key}
                      type="number"
                      value={formData[item.key as keyof typeof formData]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [item.key]: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {macroItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg ${item.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-xl font-bold">
                {formData[item.key as keyof typeof formData]}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {item.unit}
                </span>
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
