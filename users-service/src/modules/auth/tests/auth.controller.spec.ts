import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthResponse: AuthResponse = {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
    },
    access_token: 'mock.jwt.token',
  };

  const mockAuthService = {
    authenticate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return AuthResponse for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };

      mockAuthService.authenticate.mockResolvedValue(mockAuthResponse);

      const result = await authController.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.authenticate.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
