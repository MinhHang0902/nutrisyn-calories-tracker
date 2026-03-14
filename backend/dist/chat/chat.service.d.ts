import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ChatHistory } from './entities/chat-history.entity';
export declare class ChatService {
    private chatHistoryRepository;
    private httpService;
    private configService;
    private aiServiceUrl;
    constructor(chatHistoryRepository: Repository<ChatHistory>, httpService: HttpService, configService: ConfigService);
    sendMessage(userId: string, message: string, context?: any): Promise<{
        message: any;
    }>;
    getHistory(userId: string): Promise<ChatHistory[]>;
}
