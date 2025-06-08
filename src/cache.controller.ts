// src/cache/cache.controller.ts
import { Controller, Delete, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('system')
@Controller('system/cache')
export class CacheController {
  private readonly logger = new Logger(CacheController.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

  @Delete('flush')
  @ApiOperation({
    summary: 'Limpiar toda la caché',
    description: 'Borra todas las claves del sistema desde MemoryStore.',
  })
  @ApiResponse({
    status: 200,
    description: 'La caché fue limpiada exitosamente.',
  })
  async flushAll() {
    const store: any = (this.cacheService as any).store;

    // Acceso no tipado pero funcional con memoryStore
    const memoryStore = store?.store;

    if (memoryStore && typeof memoryStore.keys === 'function') {
      const keys: string[] = memoryStore.keys();

      this.logger.log(`🔑 Claves detectadas: ${JSON.stringify(keys)}`);

      if (keys.length === 0) {
        this.logger.warn('⚠️ No hay claves en caché actualmente.');
      }

      for (const key of keys) {
        await this.cacheService.del(key);
        this.logger.log(`🗑️ Clave eliminada: ${key}`);
      }

      return {
        success: true,
        message: `Se eliminaron ${keys.length} claves.`,
        keys,
        timestamp: new Date().toISOString(),
      };
    }

    this.logger.error(
      '❌ No se pudo acceder a las claves del store. ¿Está configurado correctamente?',
    );
    return {
      success: false,
      message:
        'Error al acceder al caché. ¿Estás usando MemoryStore correctamente?',
    };
  }
}
