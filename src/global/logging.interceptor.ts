import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl } = req;

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = res;
        const delay = Date.now() - now;

        this.logger.log(`${method} ${originalUrl} ${statusCode} +${delay}ms`);
      }),
    );
  }
}
