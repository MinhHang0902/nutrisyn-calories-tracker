import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        avatar: string;
        createdAt: Date;
    }>;
    updateProfile(req: any, data: {
        name?: string;
        avatar?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        avatar: string;
        createdAt: Date;
    }>;
}
