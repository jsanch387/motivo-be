import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './global/logging.interceptor';
import { json, urlencoded } from 'express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ✅ Capture raw body manually for Stripe webhook
  app.use(
    '/payments/webhook',
    express.raw({ type: 'application/json' }),
    (req: any, _res, next) => {
      req.rawBody = req.body;
      next();
    },
  );

  // ✅ Apply JSON and URL encoding for all other routes
  app.use(json());
  app.use(urlencoded({ extended: true }));

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
