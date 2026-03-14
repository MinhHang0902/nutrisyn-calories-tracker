export declare class UserProfile {
    id: string;
    userId: string;
    age: number;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    goal: 'lose_weight' | 'gain_muscle' | 'maintain';
    bmi: number;
    bmr: number;
    tdee: number;
    calorieTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    updatedAt: Date;
}
