"use client";

import { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useSpring, animated } from "react-spring";
import { cn } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface NutritionGaugeProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: "protein" | "carbs" | "fat" | "calories";
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const colorMap = {
  protein: { primary: "#3b82f6", light: "#dbeafe" },
  carbs: { primary: "#22c55e", light: "#dcfce7" },
  fat: { primary: "#eab308", light: "#fef9c3" },
  calories: { primary: "#8b5cf6", light: "#ede9fe" },
};

const sizeMap = {
  sm: { width: 80, fontSize: "text-sm" },
  md: { width: 120, fontSize: "text-lg" },
  lg: { width: 160, fontSize: "text-xl" },
};

export function NutritionGauge({
  label,
  current,
  target,
  unit = "g",
  color = "protein",
  size = "md",
  showValue = true,
}: NutritionGaugeProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 150) : 0;
  const displayPercentage = Math.min(percentage, 100);
  
  const colors = colorMap[color];
  const gaugeSize = sizeMap[size];

  const { number } = useSpring({
    number: current,
    from: { number: 0 },
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const getStatusColor = () => {
    if (percentage > 120) return "#ef4444";
    if (percentage > 90) return "#22c55e";
    if (percentage > 70) return "#eab308";
    return colors.primary;
  };

  const data = {
    datasets: [
      {
        data: [displayPercentage, 100 - displayPercentage],
        backgroundColor: [getStatusColor(), "#e5e7eb"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: gaugeSize.width, height: gaugeSize.width }}
      >
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <animated.span
              className={cn("font-bold", gaugeSize.fontSize)}
              style={{ color: colors.primary }}
            >
              {number.to((n) => Math.round(n))}
            </animated.span>
          )}
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-center">{label}</span>
      <span className="text-xs text-muted-foreground">
        {Math.round(percentage)}% / {target}{unit}
      </span>
    </div>
  );
}
