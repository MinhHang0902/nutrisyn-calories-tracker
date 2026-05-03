import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
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
    @Body() body: { message: string; sessionId: string; context?: any },
  ) {
    return this.chatService.sendMessage(req.user.id, body.message, body.sessionId, body.context);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat sessions history' })
  async getHistory(@Request() req) {
    return this.chatService.getHistory(req.user.id);
  }

  @Get('history/:sessionId')
  @ApiOperation({ summary: 'Get a specific chat session' })
  async getSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.chatService.getSession(req.user.id, sessionId);
  }

  @Delete('history/:sessionId')
  @ApiOperation({ summary: 'Delete a chat session' })
  async deleteSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.chatService.deleteSession(req.user.id, sessionId);
  }
}
