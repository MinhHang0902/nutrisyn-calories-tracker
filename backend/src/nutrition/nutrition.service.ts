import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NutritionService {
  private aiServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async analyzeImage(file: Express.Multer.File) {
    try {
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/analyze`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException('AI analysis failed', 500);
    }
  }

  async searchFood(query: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/search`, {
          params: { q: query },
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Food search failed', 500);
    }
  }

  async generateMealPlan(data: {
    calories: number;
    cuisine?: string;
    mealType: string;
    ingredients?: string[];
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/meal-plan`, data)
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Meal plan generation failed', 500);
    }
  }
}
