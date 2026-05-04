import { Injectable, NotFoundException } from '@nestjs/common';
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

  async sendMessage(userId: string, message: string, sessionId: string, context?: any) {
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
        sessionId,
      });

      return { message: assistantMessage };
    } catch (error) {
      throw new Error('Chat service failed');
    }
  }

  async getHistory(userId: string) {
    const records = await this.chatHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    const sessionMap = new Map<string, any>();

    records.forEach((record) => {
      const sid = record.sessionId || 'no-session-' + record.id;
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, {
          sessionId: sid,
          messages: [],
          firstMessage: record.userMessage,
          lastMessage: record.assistantMessage,
          messageCount: 0,
          createdAt: record.createdAt,
          updatedAt: record.createdAt,
        });
      }
      const session = sessionMap.get(sid);
      session.messages.push({
        id: record.id,
        role: 'user',
        content: record.userMessage,
        timestamp: record.createdAt,
      });
      session.messages.push({
        id: record.id + '-assistant',
        role: 'assistant',
        content: record.assistantMessage,
        timestamp: record.createdAt,
      });
      session.messageCount++;
      session.updatedAt = record.createdAt;
    });

    const sessions = Array.from(sessionMap.values())
      .map((s) => ({
        sessionId: s.sessionId,
        firstMessage: s.firstMessage,
        lastMessage: s.lastMessage,
        messageCount: s.messageCount,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        messages: s.messages,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return sessions;
  }

  async getSession(userId: string, sessionId: string | null) {
    const records = await this.chatHistoryRepository.find({
      where: { userId, sessionId: sessionId as any },
      order: { createdAt: 'ASC' },
    });

    const messages = records.flatMap((r) => [
      { id: r.id, role: 'user', content: r.userMessage, timestamp: r.createdAt },
      { id: r.id + '-assistant', role: 'assistant', content: r.assistantMessage, timestamp: r.createdAt },
    ]);

    return { sessionId, messages, createdAt: records[0]?.createdAt };
  }

  async deleteSession(userId: string, sessionId: string | null) {
    if (sessionId) {
      const result = await this.chatHistoryRepository.delete({ userId, sessionId });
      if (result.affected === 0) {
        throw new NotFoundException('Chat session not found');
      }
    } else {
      const records = await this.chatHistoryRepository.find({
        where: { userId, sessionId: null as any },
      });
      for (const record of records) {
        await this.chatHistoryRepository.delete(record.id);
      }
    }
    return { message: 'Chat session deleted' };
  }
}
