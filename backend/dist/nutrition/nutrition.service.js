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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NutritionService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let NutritionService = class NutritionService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
    }
    async analyzeImage(file) {
        try {
            const formData = new FormData();
            const blob = new Blob([file.buffer], { type: file.mimetype });
            formData.append('file', blob, file.originalname);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.aiServiceUrl}/api/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }));
            return response.data;
        }
        catch (error) {
            throw new common_1.HttpException('AI analysis failed', 500);
        }
    }
    async searchFood(query) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.aiServiceUrl}/api/search`, {
                params: { q: query },
            }));
            return response.data;
        }
        catch (error) {
            throw new common_1.HttpException('Food search failed', 500);
        }
    }
    async generateMealPlan(data) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.aiServiceUrl}/api/meal-plan`, data));
            return response.data;
        }
        catch (error) {
            throw new common_1.HttpException('Meal plan generation failed', 500);
        }
    }
};
exports.NutritionService = NutritionService;
exports.NutritionService = NutritionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], NutritionService);
//# sourceMappingURL=nutrition.service.js.map