// src/cache/cache.controller.ts
import {
  Controller,
  Delete,
  Inject,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('system')
@Controller('system/cache')
export class CacheController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

  @Delete('flush')
  @ApiOperation({
    summary: 'Clear entire application cache',
    description:
      'Limpiar toda la caché del sistema. Operación sensible que requiere permisos.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Toda la caché fue limpiada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado para realizar esta operación',
  })
  async flushAll() {
    await this.cacheService.clear();
    return {
      success: true,
      message: 'Toda la caché del sistema ha sido limpiada',
      timestamp: new Date().toISOString(),
    };
  }
}
