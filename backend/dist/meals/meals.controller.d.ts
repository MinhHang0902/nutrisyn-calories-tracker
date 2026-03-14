/// <reference types="multer" />
import { MealsService } from './meals.service';
export declare class MealsController {
    private mealsService;
    constructor(mealsService: MealsService);
    getMeals(req: any, date?: string): Promise<import("./entities/meal.entity").Meal[]>;
    getTodayTotals(req: any): Promise<any>;
    getMeal(id: string): Promise<import("./entities/meal.entity").Meal>;
    createMeal(req: any, body: any, image?: Express.Multer.File): Promise<import("./entities/meal.entity").Meal>;
    deleteMeal(id: string): Promise<void>;
}
