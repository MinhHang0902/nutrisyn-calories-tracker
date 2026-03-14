import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a chat message' })
  async sendMessage(
    @Request() req,
    @Body() body: { message: string; context?: any },
  ) {
    return this.chatService.sendMessage(req.user.id, body.message, body.context);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat history' })
  async getHistory(@Request() req) {
    return this.chatService.getHistory(req.user.id);
  }
}
