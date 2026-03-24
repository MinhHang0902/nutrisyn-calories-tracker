import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData = require('form-data');

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
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/analyze`, formData, {
          headers: formData.getHeaders(),
        })
      );
      return response.data;
    } catch (error) {
      console.log('AI analysis error:', error?.response?.data || error.message);
      const message = error?.response?.data?.detail || 'AI analysis failed';
      throw new HttpException(message, error?.response?.status || 500);
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
