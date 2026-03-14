import { Controller, Post, Get, Body, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('nutrition')
@Controller('nutrition')
export class NutritionController {
  constructor(private nutritionService: NutritionService) {}

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Analyze meal image' })
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    return this.nutritionService.analyzeImage(file);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search food nutrition' })
  async searchFood(@Query('q') query: string) {
    return this.nutritionService.searchFood(query);
  }

  @Post('meal-plan')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate meal plan' })
  async generateMealPlan(@Body() data: {
    calories: number;
    cuisine?: string;
    mealType: string;
    ingredients?: string[];
  }) {
    return this.nutritionService.generateMealPlan(data);
  }
}
