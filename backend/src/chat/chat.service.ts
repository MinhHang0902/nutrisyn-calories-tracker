import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ChatHistory } from './entities/chat-history.entity';

@Injectable()
export class ChatService {
  private aiServiceUrl: string;

  constructor(
    @InjectRepository(ChatHistory)
    private chatHistoryRepository: Repository<ChatHistory>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async sendMessage(userId: string, message: string, context?: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/chat`, {
          message,
          context,
        })
      );

      const assistantMessage = response.data.message;

      await this.chatHistoryRepository.save({
        userMessage: message,
        assistantMessage,
        userId,
      });

      return { message: assistantMessage };
    } catch (error) {
      throw new Error('Chat service failed');
    }
  }

  async getHistory(userId: string) {
    return this.chatHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
