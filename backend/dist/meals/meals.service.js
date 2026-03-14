"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meal_entity_1 = require("./entities/meal.entity");
let MealsService = class MealsService {
    constructor(mealsRepository) {
        this.mealsRepository = mealsRepository;
    }
    async create(userId, data) {
        const meal = this.mealsRepository.create({
            ...data,
            userId,
        });
        return this.mealsRepository.save(meal);
    }
    async findByUser(userId, date) {
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
    async findById(id) {
        return this.mealsRepository.findOne({ where: { id } });
    }
    async delete(id) {
        await this.mealsRepository.delete(id);
    }
    async getTodayTotals(userId) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const meals = await this.mealsRepository.find({
            where: {
                userId,
                createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
        });
        return meals.reduce((acc, meal) => ({
            calories: acc.calories + Number(meal.totalCalories),
            protein: acc.protein + Number(meal.totalProtein),
            carbs: acc.carbs + Number(meal.totalCarbs),
            fat: acc.fat + Number(meal.totalFat),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
};
exports.MealsService = MealsService;
exports.MealsService = MealsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meal_entity_1.Meal)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MealsService);
//# sourceMappingURL=meals.service.js.map