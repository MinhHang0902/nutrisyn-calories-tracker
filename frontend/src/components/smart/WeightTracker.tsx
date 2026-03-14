"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Scale, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { motion } from "framer-motion";

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightTrackerProps {
  currentWeight?: number;
  goalWeight?: number;
}

const STORAGE_KEY = "nutrisyn_weight_history";

export function WeightTracker({ currentWeight, goalWeight }: WeightTrackerProps) {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(currentWeight?.toString() || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (currentWeight && !parsed.find((e: WeightEntry) => e.date === format(new Date(), "yyyy-MM-dd"))) {
          parsed.push({ date: format(new Date(), "yyyy-MM-dd"), weight: currentWeight });
        }
        setWeightHistory(parsed);
      } catch {
        setWeightHistory([]);
      }
    } else if (currentWeight) {
      const initial = [{ date: format(new Date(), "yyyy-MM-dd"), weight: currentWeight }];
      setWeightHistory(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
    setIsLoading(false);
  }, [currentWeight]);

  const handleAddWeight = () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) return;

    const today = format(new Date(), "yyyy-MM-dd");
    let updated: WeightEntry[];
    
    const existingIndex = weightHistory.findIndex(e => e.date === today);
    if (existingIndex >= 0) {
      updated = [...weightHistory];
      updated[existingIndex] = { date: today, weight };
    } else {
      updated = [...weightHistory, { date: today, weight }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    setWeightHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setIsAddOpen(false);
    setNewWeight("");
  };

  const getTrend = () => {
    if (weightHistory.length < 2) return null;
    const recent = weightHistory.slice(-7);
    if (recent.length < 2) return null;
    
    const first = recent[0].weight;
    const last = recent[recent.length - 1].weight;
    const diff = last - first;
    
    if (Math.abs(diff) < 0.5) return { icon: Minus, label: "Stable", color: "text-muted-foreground" };
    if (diff > 0) return { icon: TrendingUp, label: `+${diff.toFixed(1)}kg`, color: "text-red-500" };
    return { icon: TrendingDown, label: `${diff.toFixed(1)}kg`, color: "text-green-500" };
  };

  const trend = getTrend();
  const latestWeight = weightHistory.length > 0 
    ? weightHistory[weightHistory.length - 1].weight 
    : currentWeight;

  const displayWeight = typeof latestWeight === 'number' ? latestWeight : undefined;

  const chartData = weightHistory
    .slice(-30)
    .map(entry => ({
      date: format(parseISO(entry.date), "MMM dd"),
      weight: entry.weight,
    }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Weight Tracker
          </CardTitle>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Log Weight
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Your Weight</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddWeight}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{displayWeight !== undefined ? displayWeight.toFixed(1) : "--"} kg</p>
            {goalWeight && (
              <p className="text-sm text-muted-foreground">
                Goal: {goalWeight} kg
              </p>
            )}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend.color}`}>
              <trend.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{trend.label}</span>
            </div>
          )}
        </div>

        {!isLoading && chartData.length > 0 && (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${Number(value).toFixed(1)} kg`, 'Weight']}
                />
                {goalWeight && (
                  <ReferenceLine 
                    y={goalWeight} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="5 5"
                  />
                )}
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartData.length === 0 && (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
            No weight data yet. Start tracking!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
