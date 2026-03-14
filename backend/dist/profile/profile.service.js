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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_profile_entity_1 = require("./entities/user-profile.entity");
let ProfileService = class ProfileService {
    constructor(profileRepository) {
        this.profileRepository = profileRepository;
    }
    async getProfile(userId) {
        return this.profileRepository.findOne({ where: { userId } });
    }
    async updateProfile(userId, data) {
        let profile = await this.getProfile(userId);
        if (profile) {
            await this.profileRepository.update(profile.id, data);
            profile = { ...profile, ...data };
        }
        else {
            profile = this.profileRepository.create({ ...data, userId });
            await this.profileRepository.save(profile);
        }
        return this.calculateMetrics(profile);
    }
    async updateBodyMetrics(userId, data) {
        const profile = await this.getProfile(userId);
        if (!profile) {
            return this.updateProfile(userId, data);
        }
        const updated = { ...profile, ...data };
        const calculated = this.calculateMetrics(updated);
        await this.profileRepository.update(profile.id, calculated);
        return calculated;
    }
    calculateMetrics(profile) {
        const { weight, height, age, gender, activityLevel, goal } = profile;
        if (!weight || !height || !age || !gender) {
            return profile;
        }
        const heightInMeters = Number(height) / 100;
        const bmi = Number(weight) / (heightInMeters * heightInMeters);
        let bmr;
        if (gender === 'male') {
            bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * age + 5;
        }
        else {
            bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * age - 161;
        }
        const activityMultipliers = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            extra_active: 1.9,
        };
        const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
        let calorieTarget = tdee;
        if (goal === 'lose_weight') {
            calorieTarget = tdee - 500;
        }
        else if (goal === 'gain_muscle') {
            calorieTarget = tdee + 500;
        }
        let proteinTarget, carbsTarget, fatTarget;
        if (goal === 'lose_weight') {
            proteinTarget = Number(weight) * 1.8;
            fatTarget = (calorieTarget * 0.25) / 9;
            carbsTarget = (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4;
        }
        else if (goal === 'gain_muscle') {
            proteinTarget = Number(weight) * 2.2;
            fatTarget = (calorieTarget * 0.25) / 9;
            carbsTarget = (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4;
        }
        else {
            proteinTarget = Number(weight) * 1.2;
            fatTarget = (calorieTarget * 0.3) / 9;
            carbsTarget = (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4;
        }
        return {
            ...profile,
            bmi: Math.round(bmi * 100) / 100,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            calorieTarget: Math.round(calorieTarget),
            proteinTarget: Math.round(proteinTarget),
            carbsTarget: Math.round(carbsTarget),
            fatTarget: Math.round(fatTarget),
        };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProfileService);
//# sourceMappingURL=profile.service.js.map