import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    /**
     * Elimina una clave específica de la caché
     * @param key Clave a eliminar
     */
    async deleteKey(key: string): Promise<void> {
        this.logger.debug(`Eliminando clave de caché: ${key}`);
        try {
            await this.cacheManager.del(key);
            this.logger.log(`Clave eliminada correctamente: ${key}`);
        } catch (error) {
            this.logger.error(`Error al eliminar clave ${key}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Limpia toda la caché
     */
    async resetCache(): Promise<void> {
        this.logger.debug('Iniciando limpieza completa de caché');
        try {
            await this.cacheManager.clear();
            this.logger.log('Caché limpiada completamente');
        } catch (error) {
            this.logger.error(`Error al limpiar caché: ${error.message}`);
            throw error;
        }
    }
}