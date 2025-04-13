import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly SECRET = 'TU_SECRETO_COMPARTIDO';
    private readonly API_KEY_TTL = 24 * 60 * 60 * 1000;

    private generateApiKey(): string {
        const today = new Date();
        const datePart = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
        return crypto
            .createHash('sha256')
            .update(`${datePart}:${this.SECRET}`)
            .digest('hex');
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const clientApiKey = request.headers['x-api-key'];

        if (!clientApiKey) {
            throw new UnauthorizedException('API Key requerida');
        }

        const validApiKey = this.generateApiKey();
        if (clientApiKey !== validApiKey) {
            throw new UnauthorizedException('API Key inválida');
        }

        return true;
    }
}
