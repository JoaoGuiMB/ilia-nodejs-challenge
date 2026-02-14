import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthController } from '../health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let dataSource: DataSource;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return status ok when database is connected', async () => {
      mockDataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return ISO timestamp', async () => {
      mockDataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check();

      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(result.timestamp).toMatch(isoRegex);
    });

    it('should throw ServiceUnavailableException when database is down', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Connection refused'));

      await expect(controller.check()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should include error details when database is down', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Connection refused'));

      try {
        await controller.check();
        fail('Expected ServiceUnavailableException');
      } catch (error) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        const response = error.getResponse();
        expect(response.status).toBe('error');
        expect(response.message).toBe('Database connection failed');
        expect(response.timestamp).toBeDefined();
      }
    });

    it('should handle timeout errors', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Query timeout'));

      await expect(controller.check()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
