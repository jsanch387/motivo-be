import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { DatabaseModule } from './common/database/database.module';
import { AiModule } from './modules/ai/ai.module';
import { AiController } from './modules/ai/ai.controller';
import { OpenAIModule } from './common/openai/openai.module';
import { AiService } from './modules/ai/ai.service';
import { GoogleAIModule } from './common/genai/genai.module';
import { PaymentController } from './modules/payments/payments.controller';
import { PaymentsModule } from './modules/payments/payments.module';
import { PaymentsService } from './modules/payments/payments.service';
import { LaunchModule } from './modules/launch/launch.module';
import { LaunchService } from './modules/launch/launch.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ Ensure .env is loaded
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 3600, // 1 hour
          limit: 30, // max 30 requests/hour/user
        },
      ],
    }),
    DatabaseModule,
    DashboardModule,
    OnboardingModule,
    AiModule,
    OpenAIModule,
    GoogleAIModule,
    PaymentsModule,
    LaunchModule,
  ],
  controllers: [AppController, AiController, PaymentController],
  providers: [
    AppService,
    AiService,
    LaunchService,
    PaymentsService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
