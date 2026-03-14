import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
type Goal = 'lose_weight' | 'gain_muscle' | 'maintain';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Request() req,
    @Body() body: {
      age?: number;
      gender?: Gender;
      height?: number;
      weight?: number;
      activityLevel?: ActivityLevel;
      goal?: Goal;
    },
  ) {
    return this.profileService.updateBodyMetrics(req.user.id, body);
  }

  @Put('body-metrics')
  @ApiOperation({ summary: 'Update body metrics' })
  async updateBodyMetrics(
    @Request() req,
    @Body() body: {
      age: number;
      gender: Gender;
      height: number;
      weight: number;
      activityLevel: ActivityLevel;
      goal: Goal;
    },
  ) {
    return this.profileService.updateBodyMetrics(req.user.id, body);
  }
}
