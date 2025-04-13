import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheKeyInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const cacheKey = this.reflector.get<string>('cacheKey', context.getHandler());

        if (cacheKey && request.params) {
            // Reemplaza las variables en el cacheKey
            const dynamicCacheKey = cacheKey.replace(/\$\{([^}]+)\}/g, (_, key) => request.params[key]);
            request.cacheKey = dynamicCacheKey;
        }

        return next.handle();
    }
}