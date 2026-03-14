import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Meal } from './entities/meal.entity';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal)
    private mealsRepository: Repository<Meal>,
  ) {}

  async create(userId: string, data: Partial<Meal>): Promise<Meal> {
    const meal = this.mealsRepository.create({
      ...data,
      userId,
    });
    return this.mealsRepository.save(meal);
  }

  async findByUser(userId: string, date?: string): Promise<Meal[]> {
    const query = this.mealsRepository
      .createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .orderBy('meal.createdAt', 'DESC');

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.andWhere('meal.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Meal | null> {
    return this.mealsRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.mealsRepository.delete(id);
  }

  async getTodayTotals(userId: string): Promise<any> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const meals = await this.mealsRepository.find({
      where: {
        userId,
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + Number(meal.totalCalories),
        protein: acc.protein + Number(meal.totalProtein),
        carbs: acc.carbs + Number(meal.totalCarbs),
        fat: acc.fat + Number(meal.totalFat),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }
}
