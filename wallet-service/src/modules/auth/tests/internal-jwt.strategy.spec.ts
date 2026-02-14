import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { InternalJwtStrategy } from '../strategies/internal-jwt.strategy';

describe('InternalJwtStrategy', () => {
  const JWT_INTERNAL_SECRET = 'ILIACHALLENGE_INTERNAL';
  const JWT_EXTERNAL_SECRET = 'ILIACHALLENGE';

  let strategy: InternalJwtStrategy;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_INTERNAL_SECRET') {
        return JWT_INTERNAL_SECRET;
      }
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternalJwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<InternalJwtStrategy>(InternalJwtStrategy);
  });

  describe('validate', () => {
    it('should return payload with sub and email', () => {
      const payload = {
        sub: 'users-service',
        email: 'internal@service.local',
        type: 'internal',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        sub: 'users-service',
        email: 'internal@service.local',
      });
    });
  });

  describe('constructor', () => {
    it('should throw error when JWT_INTERNAL_SECRET is not defined', async () => {
      const invalidConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            InternalJwtStrategy,
            { provide: ConfigService, useValue: invalidConfigService },
          ],
        }).compile(),
      ).rejects.toThrow('JWT_INTERNAL_SECRET is not defined');
    });
  });

  describe('token validation', () => {
    it('should validate tokens signed with internal secret', () => {
      const payload = {
        sub: 'users-service',
        email: 'internal@service.local',
      };

      const token = jwt.sign(payload, JWT_INTERNAL_SECRET, { expiresIn: '5m' });
      const decoded = jwt.verify(token, JWT_INTERNAL_SECRET) as jwt.JwtPayload;

      expect(decoded.sub).toBe('users-service');
      expect(decoded.email).toBe('internal@service.local');
    });

    it('should reject tokens signed with external secret', () => {
      const payload = {
        sub: 'user-123',
        email: 'user@example.com',
      };

      const token = jwt.sign(payload, JWT_EXTERNAL_SECRET, { expiresIn: '24h' });

      expect(() => {
        jwt.verify(token, JWT_INTERNAL_SECRET);
      }).toThrow();
    });

    it('should reject expired tokens', () => {
      const payload = {
        sub: 'users-service',
        email: 'internal@service.local',
      };

      const token = jwt.sign(payload, JWT_INTERNAL_SECRET, { expiresIn: '-1s' });

      expect(() => {
        jwt.verify(token, JWT_INTERNAL_SECRET);
      }).toThrow();
    });
  });
});
