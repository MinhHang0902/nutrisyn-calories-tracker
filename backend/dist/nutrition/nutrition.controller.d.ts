/// <reference types="multer" />
import { NutritionService } from './nutrition.service';
export declare class NutritionController {
    private nutritionService;
    constructor(nutritionService: NutritionService);
    analyzeImage(file: Express.Multer.File): Promise<any>;
    searchFood(query: string): Promise<any>;
    generateMealPlan(data: {
        calories: number;
        cuisine?: string;
        mealType: string;
        ingredients?: string[];
    }): Promise<any>;
}
