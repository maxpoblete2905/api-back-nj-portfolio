import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);
    private readonly defaultTTL = 60 * 60 * 2; // 2 horas en segundos

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.cacheManager.get<T>(key);
            this.logger.debug(`Cache ${key} ${value ? 'hit' : 'miss'}`);
            return value || null;
        } catch (error) {
            this.logger.error(`Error getting cache ${key}: ${error.message}`);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            await this.cacheManager.set(key, value, ttl ?? this.defaultTTL);
            this.logger.debug(`Cache set for ${key}`);
        } catch (error) {
            this.logger.error(`Error setting cache ${key}: ${error.message}`);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache deleted for ${key}`);
        } catch (error) {
            this.logger.error(`Error deleting cache ${key}: ${error.message}`);
        }
    }

    async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached) return cached;

        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }

    async clear(): Promise<void> {
        try {
            await this.cacheManager.clear();
            this.logger.log('Cache cleared completely');
        } catch (error) {
            this.logger.error(`Error clearing cache: ${error.message}`);
        }
    }
}