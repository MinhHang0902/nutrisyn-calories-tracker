import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: { email: string; password: string; name: string }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateProfile(id: string, data: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string }): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    if (data.name) {
      user.name = data.name;
    }
    if (data.avatar) {
      user.avatar = data.avatar;
    }
    if (data.newPassword && data.currentPassword) {
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      user.password = await bcrypt.hash(data.newPassword, 10);
    }

    return this.usersRepository.save(user);
  }
}
