"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X, XCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type AlertType = "info" | "success" | "warning" | "error" | "suggestion";

interface SmartAlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  suggestion?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoClose?: number;
  className?: string;
}

const alertConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
  },
  suggestion: {
    icon: Lightbulb,
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

export function SmartAlert({
  type = "info",
  title,
  message,
  suggestion,
  dismissible = true,
  onDismiss,
  autoClose,
  className,
}: SmartAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const config = alertConfig[type];
  const Icon = config.icon;

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, handleDismiss]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative rounded-lg border p-4",
            config.bgColor,
            config.borderColor,
            className
          )}
        >
          <div className="flex gap-3">
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
            <div className="flex-1 min-w-0">
              {title && (
                <p className="font-semibold text-sm mb-1">{title}</p>
              )}
              <p className="text-sm">{message}</p>
              {suggestion && (
                <p className="text-sm mt-2 font-medium text-primary">
                  💡 {suggestion}
                </p>
              )}
            </div>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MealRecommendationProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onDismiss?: () => void;
}

export function MealRecommendation({
  nutrition,
  targets,
  onDismiss,
}: MealRecommendationProps) {
  const getRecommendation = () => {
    const proteinPercentage = (nutrition.protein / targets.protein) * 100;
    const carbsPercentage = (nutrition.carbs / targets.carbs) * 100;
    const fatPercentage = (nutrition.fat / targets.fat) * 100;
    const caloriesPercentage = (nutrition.calories / targets.calories) * 100;

    if (caloriesPercentage >= 100) {
      return {
        type: "warning" as AlertType,
        message: "You've reached your daily calorie target.",
        suggestion: "Consider a light snack or skip the next meal to stay on track.",
      };
    }

    if (proteinPercentage < 50) {
      return {
        type: "suggestion" as AlertType,
        message: "Protein intake is low.",
        suggestion: "Add grilled chicken breast, Greek yogurt, or tofu to your next meal.",
      };
    }

    if (carbsPercentage > 120) {
      return {
        type: "warning" as AlertType,
        message: "Carbohydrate intake is high.",
        suggestion: "Prioritize green vegetables and lean protein for your next meal.",
      };
    }

    if (fatPercentage > 120) {
      return {
        type: "warning" as AlertType,
        message: "Fat intake is high.",
        suggestion: "Choose boiled or steamed dishes, avoid fried foods.",
      };
    }

    if (caloriesPercentage < 50) {
      return {
        type: "suggestion" as AlertType,
        message: "You still have calories remaining.",
        suggestion: "Perfect time for a balanced meal to fuel your day!",
      };
    }

    return {
      type: "success" as AlertType,
      message: "Your nutrition is well balanced!",
      suggestion: "Keep up the good work!",
    };
  };

  const recommendation = getRecommendation();

  return (
    <SmartAlert
      type={recommendation.type}
      title="Meal Recommendation"
      message={recommendation.message}
      suggestion={recommendation.suggestion}
      onDismiss={onDismiss}
      autoClose={10000}
    />
  );
}
