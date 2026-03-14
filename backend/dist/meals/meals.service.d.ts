import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
export declare class MealsService {
    private mealsRepository;
    constructor(mealsRepository: Repository<Meal>);
    create(userId: string, data: Partial<Meal>): Promise<Meal>;
    findByUser(userId: string, date?: string): Promise<Meal[]>;
    findById(id: string): Promise<Meal | null>;
    delete(id: string): Promise<void>;
    getTodayTotals(userId: string): Promise<any>;
}
