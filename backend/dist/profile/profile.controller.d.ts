import { ProfileService } from './profile.service';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
type Goal = 'lose_weight' | 'gain_muscle' | 'maintain';
export declare class ProfileController {
    private profileService;
    constructor(profileService: ProfileService);
    getProfile(req: any): Promise<import("./entities/user-profile.entity").UserProfile>;
    updateProfile(req: any, body: {
        age?: number;
        gender?: Gender;
        height?: number;
        weight?: number;
        activityLevel?: ActivityLevel;
        goal?: Goal;
    }): Promise<import("./entities/user-profile.entity").UserProfile>;
    updateBodyMetrics(req: any, body: {
        age: number;
        gender: Gender;
        height: number;
        weight: number;
        activityLevel: ActivityLevel;
        goal: Goal;
    }): Promise<import("./entities/user-profile.entity").UserProfile>;
}
export {};
