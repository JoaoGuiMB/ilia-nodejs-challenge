import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns service health status and verifies database connectivity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy - database connection failed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Database connection failed' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async check(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
