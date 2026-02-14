import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {
  IUsersRepository,
  CreateUserData,
  UpdateUserData,
} from './interfaces/users-repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findOne(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
}
