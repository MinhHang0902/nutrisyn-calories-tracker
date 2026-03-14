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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const chat_history_entity_1 = require("./entities/chat-history.entity");
let ChatService = class ChatService {
    constructor(chatHistoryRepository, httpService, configService) {
        this.chatHistoryRepository = chatHistoryRepository;
        this.httpService = httpService;
        this.configService = configService;
        this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
    }
    async sendMessage(userId, message, context) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.aiServiceUrl}/api/chat`, {
                message,
                context,
            }));
            const assistantMessage = response.data.message;
            await this.chatHistoryRepository.save({
                userMessage: message,
                assistantMessage,
                userId,
            });
            return { message: assistantMessage };
        }
        catch (error) {
            throw new Error('Chat service failed');
        }
    }
    async getHistory(userId) {
        return this.chatHistoryRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_history_entity_1.ChatHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        axios_1.HttpService,
        config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map