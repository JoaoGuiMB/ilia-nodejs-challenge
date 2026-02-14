import { User } from '../entities/user.entity';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface IUsersRepository {
  create(data: CreateUserData): Promise<User>;
  findOne(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
