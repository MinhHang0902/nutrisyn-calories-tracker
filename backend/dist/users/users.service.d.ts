import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    updateProfile(id: string, data: {
        name?: string;
        avatar?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<User | null>;
}
