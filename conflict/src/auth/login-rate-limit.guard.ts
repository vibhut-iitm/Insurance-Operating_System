import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, number[]>();

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const client = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const recent = (this.attempts.get(client) ?? []).filter((timestamp) => now - timestamp < 60_000);
    if (recent.length >= 5) throw new HttpException('Too many login attempts. Try again shortly.', HttpStatus.TOO_MANY_REQUESTS);
    recent.push(now);
    this.attempts.set(client, recent);
    if (this.attempts.size > 10_000) {
      for (const [key, timestamps] of this.attempts) {
        if (timestamps.every((timestamp) => now - timestamp >= 60_000)) this.attempts.delete(key);
      }
    }
    return true;
  }
}
