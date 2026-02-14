import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UsersRepository } from '../users.repository';
import { User } from '../entities/user.entity';
import { CreateUserData } from '../interfaces/users-repository.interface';

describe('UsersRepository Integration', () => {
  let usersRepository: UsersRepository;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            entities: [User],
            synchronize: true,
            dropSchema: true,
          }),
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersRepository],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE users CASCADE');
  });

  describe('Entity persistence', () => {
    it('should save a user to the database with correct column mapping', async () => {
      const createUserData: CreateUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword123',
      };

      const user = await usersRepository.create(createUserData);

      expect(user.id).toBeDefined();
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.password).toBe('hashedPassword123');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);

      const rawResult = await dataSource.query(
        'SELECT id, first_name, last_name, email, password, created_at, updated_at FROM users WHERE id = $1',
        [user.id],
      );

      expect(rawResult).toHaveLength(1);
      expect(rawResult[0].first_name).toBe('John');
      expect(rawResult[0].last_name).toBe('Doe');
      expect(rawResult[0].email).toBe('john.doe@example.com');
    });

    it('should retrieve a saved user by id', async () => {
      const createUserData: CreateUserData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'anotherPassword',
      };

      const createdUser = await usersRepository.create(createUserData);
      const foundUser = await usersRepository.findOne(createdUser.id);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.firstName).toBe('Jane');
      expect(foundUser?.email).toBe('jane.smith@example.com');
    });

    it('should retrieve a saved user by email', async () => {
      const createUserData: CreateUserData = {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        password: 'password123',
      };

      await usersRepository.create(createUserData);
      const foundUser = await usersRepository.findByEmail('bob.wilson@example.com');

      expect(foundUser).not.toBeNull();
      expect(foundUser?.firstName).toBe('Bob');
      expect(foundUser?.lastName).toBe('Wilson');
    });

    it('should update user data correctly', async () => {
      const createUserData: CreateUserData = {
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@example.com',
        password: 'password',
      };

      const user = await usersRepository.create(createUserData);
      const updatedUser = await usersRepository.update(user.id, {
        firstName: 'Alicia',
        lastName: 'Green',
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.firstName).toBe('Alicia');
      expect(updatedUser?.lastName).toBe('Green');
      expect(updatedUser?.email).toBe('alice.brown@example.com');
    });

    it('should delete a user', async () => {
      const createUserData: CreateUserData = {
        firstName: 'Charlie',
        lastName: 'Davis',
        email: 'charlie.davis@example.com',
        password: 'password',
      };

      const user = await usersRepository.create(createUserData);
      const deleted = await usersRepository.delete(user.id);
      const foundUser = await usersRepository.findOne(user.id);

      expect(deleted).toBe(true);
      expect(foundUser).toBeNull();
    });

    it('should return all users', async () => {
      await usersRepository.create({
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        password: 'password',
      });

      await usersRepository.create({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        password: 'password',
      });

      const users = await usersRepository.findAll();

      expect(users).toHaveLength(2);
    });
  });

  describe('Unique email constraint', () => {
    it('should throw an error when creating a user with duplicate email', async () => {
      const createUserData: CreateUserData = {
        firstName: 'First',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await usersRepository.create(createUserData);

      const duplicateUserData: CreateUserData = {
        firstName: 'Second',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'differentPassword',
      };

      await expect(usersRepository.create(duplicateUserData)).rejects.toThrow();
    });

    it('should allow creating users with different emails', async () => {
      const user1 = await usersRepository.create({
        firstName: 'User',
        lastName: 'One',
        email: 'unique1@example.com',
        password: 'password',
      });

      const user2 = await usersRepository.create({
        firstName: 'User',
        lastName: 'Two',
        email: 'unique2@example.com',
        password: 'password',
      });

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).not.toBe(user2.email);
    });
  });

  describe('Database table structure', () => {
    interface ColumnInfo {
      column_name: string;
      data_type: string;
      is_nullable: string;
      character_maximum_length: number | null;
    }

    it('should have correct column structure', async () => {
      const columns: ColumnInfo[] = await dataSource.query(`
        SELECT column_name, data_type, is_nullable, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      const columnMap = new Map<string, ColumnInfo>(columns.map((c) => [c.column_name, c]));

      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.has('first_name')).toBe(true);
      expect(columnMap.has('last_name')).toBe(true);
      expect(columnMap.has('email')).toBe(true);
      expect(columnMap.has('password')).toBe(true);
      expect(columnMap.has('created_at')).toBe(true);
      expect(columnMap.has('updated_at')).toBe(true);

      const firstName = columnMap.get('first_name');
      expect(firstName?.character_maximum_length).toBe(100);

      const lastName = columnMap.get('last_name');
      expect(lastName?.character_maximum_length).toBe(100);
    });

    it('should have unique constraint on email', async () => {
      const constraints = await dataSource.query(`
        SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'users' AND tc.constraint_type = 'UNIQUE'
      `);

      const hasEmailUniqueConstraint = constraints.some(
        (c: { column_name: string; constraint_type: string }) =>
          c.column_name === 'email' && c.constraint_type === 'UNIQUE',
      );

      expect(hasEmailUniqueConstraint).toBe(true);
    });

    it('should generate UUID for primary key', async () => {
      const user = await usersRepository.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.uuid@example.com',
        password: 'password',
      });

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(user.id).toMatch(uuidRegex);
    });
  });
});
