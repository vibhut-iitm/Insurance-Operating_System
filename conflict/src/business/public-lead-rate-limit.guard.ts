import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PublicLeadRateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, number[]>();
  private readonly windowMs = 60_000;
  private readonly maxAttempts = 5;
  private readonly maxTrackedClients = 10_000;

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const client = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const recent = (this.attempts.get(client) ?? []).filter((timestamp) => now - timestamp < this.windowMs);
    if (recent.length >= this.maxAttempts) throw new HttpException('Too many enquiries. Try again shortly.', HttpStatus.TOO_MANY_REQUESTS);
    recent.push(now);
    this.attempts.set(client, recent);
    if (this.attempts.size > this.maxTrackedClients) {
      for (const [key, timestamps] of this.attempts) {
        if (timestamps.every((timestamp) => now - timestamp >= this.windowMs)) this.attempts.delete(key);
      }
    }
    return true;
  }
}
