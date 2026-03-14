import { Controller, Get, Put, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    const { password, ...result } = user;
    return result;
  }

  @Put('profile')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() data: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.usersService.updateProfile(req.user.id, data);
    const { password, ...result } = user;
    return result;
  }
}
