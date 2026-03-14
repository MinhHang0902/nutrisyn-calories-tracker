import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
  ) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profileRepository.findOne({ where: { userId } });
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    let profile = await this.getProfile(userId);

    if (profile) {
      await this.profileRepository.update(profile.id, data);
      profile = { ...profile, ...data };
    } else {
      profile = this.profileRepository.create({ ...data, userId });
      await this.profileRepository.save(profile);
    }

    return this.calculateMetrics(profile);
  }

  async updateBodyMetrics(userId: string, data: {
    age?: number;
    gender?: 'male' | 'female';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    goal?: 'lose_weight' | 'gain_muscle' | 'maintain';
  }): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    
    if (!profile) {
      return this.updateProfile(userId, data as any);
    }

    const updated = { ...profile, ...data } as UserProfile;
    const calculated = this.calculateMetrics(updated);
    
    await this.profileRepository.update(profile.id, calculated);
    return calculated;
  }

  private calculateMetrics(profile: UserProfile): UserProfile {
    const { weight, height, age, gender, activityLevel, goal } = profile;

    if (!weight || !height || !age || !gender) {
      return profile;
    }

    const heightInMeters = Number(height) / 100;
    const bmi = Number(weight) / (heightInMeters * heightInMeters);
    let bmr: number;

    if (gender === 'male') {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * age + 5;
    } else {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * age - 161;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
    let calorieTarget = tdee;

    if (goal === 'lose_weight') {
      calorieTarget = tdee - 500;
    } else if (goal === 'gain_muscle') {
      calorieTarget = tdee + 500;
    }

    let proteinTarget: number, carbsTarget: number, fatTarget: number;

    if (goal === 'lose_weight') {
      proteinTarget = Number(weight) * 1.8;
      fatTarget = (calorieTarget * 0.25) / 9;
      carbsTarget = (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4;
    } else if (goal === 'gain_muscle') {
      proteinTarget = Number(weight) * 2.2;
      fatTarget = (calorieTarget * 0.25) / 9;
      carbsTarget = (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4;
    } else {
      proteinTarget = Number(weight) * 1.2;
      fatTarget = (calorieTarget * 0.3) / 9;
      carbsTarget = (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4;
    }

    return {
      ...profile,
      bmi: Math.round(bmi * 100) / 100,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieTarget: Math.round(calorieTarget),
      proteinTarget: Math.round(proteinTarget),
      carbsTarget: Math.round(carbsTarget),
      fatTarget: Math.round(fatTarget),
    };
  }
}
