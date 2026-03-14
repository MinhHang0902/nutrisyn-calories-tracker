import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    sendMessage(req: any, body: {
        message: string;
        context?: any;
    }): Promise<{
        message: any;
    }>;
    getHistory(req: any): Promise<import("./entities/chat-history.entity").ChatHistory[]>;
}
