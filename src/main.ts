import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './global/logging.interceptor';
import { json, urlencoded } from 'express';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common'; // <--- ADD THIS IMPORT

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ✅ Capture raw body manually for Stripe webhook
  app.use(
    '/payments/webhook',
    express.raw({ type: 'application/json' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req: any, _res, next) => {
      req.rawBody = req.body;
      next();
    },
  );

  // ✅ Apply JSON and URL encoding for all other routes
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // 👇 ADD THESE LINES FOR GLOBAL VALIDATION PIPE
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Remove properties not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
