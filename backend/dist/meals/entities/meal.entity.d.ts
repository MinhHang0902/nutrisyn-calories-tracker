export declare class Meal {
    id: string;
    imageUrl: string;
    foods: {
        id: string;
        name: string;
        servingSize: number;
        servingUnit: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        sugar?: number;
        fiber?: number;
        sodium?: number;
        calcium?: number;
        iron?: number;
    }[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    score: 'good' | 'moderate' | 'exceed';
    createdAt: Date;
    userId: string;
}
