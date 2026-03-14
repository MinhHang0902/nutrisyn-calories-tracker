import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('meals')
@Controller('meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all meals for user' })
  async getMeals(@Request() req, @Query('date') date?: string) {
    return this.mealsService.findByUser(req.user.id, date);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today nutrition totals' })
  async getTodayTotals(@Request() req) {
    return this.mealsService.getTodayTotals(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal by ID' })
  async getMeal(@Param('id') id: string) {
    return this.mealsService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new meal' })
  async createMeal(
    @Request() req,
    @Body() body: any,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const foods = JSON.parse(body.foods || '[]');
    const mealType = body.mealType || 'lunch';
    const score = body.score || 'good';

    const totals = foods.reduce(
      (acc: any, food: any) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbohydrates,
        fat: acc.fat + food.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return this.mealsService.create(req.user.id, {
      foods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      mealType,
      score,
      imageUrl: image ? `/uploads/${image.filename}` : null,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal' })
  async deleteMeal(@Param('id') id: string) {
    return this.mealsService.delete(id);
  }
}
