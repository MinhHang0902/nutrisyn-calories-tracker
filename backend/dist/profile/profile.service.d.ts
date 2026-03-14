import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
export declare class ProfileService {
    private profileRepository;
    constructor(profileRepository: Repository<UserProfile>);
    getProfile(userId: string): Promise<UserProfile | null>;
    updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
    updateBodyMetrics(userId: string, data: {
        age?: number;
        gender?: 'male' | 'female';
        height?: number;
        weight?: number;
        activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
        goal?: 'lose_weight' | 'gain_muscle' | 'maintain';
    }): Promise<UserProfile>;
    private calculateMetrics;
}
