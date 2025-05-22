// src/health/health.controller.ts
import { Controller, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class HealthController {
  @Get('health')
  async checkHealth(@Request() req) {
    // Si necesitas acceder al request pero sin bloquear por auth
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}