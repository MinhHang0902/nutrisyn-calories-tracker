/// <reference types="multer" />
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class NutritionService {
    private httpService;
    private configService;
    private aiServiceUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    analyzeImage(file: Express.Multer.File): Promise<any>;
    searchFood(query: string): Promise<any>;
    generateMealPlan(data: {
        calories: number;
        cuisine?: string;
        mealType: string;
        ingredients?: string[];
    }): Promise<any>;
}
