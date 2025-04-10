import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { DatabaseModule } from './common/database/database.module'; // ✅
import { AiModule } from './modules/ai/ai.module';
import { AiController } from './modules/ai/ai.controller';
import { OpenAIModule } from './common/openai/openai.module';
import { AiService } from './modules/ai/ai.service';
import { GoogleAIModule } from './common/genai/genai.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PaymentController } from './modules/payment/payment.controller';
import { PaymentService } from './modules/payment/payment.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule, // ✅ Register the global DB module once
    DashboardModule,
    OnboardingModule,
    AiModule,
    OpenAIModule,
    GoogleAIModule,
    PaymentModule,
  ],
  controllers: [AppController, AiController, PaymentController],
  providers: [AppService, AiService, PaymentService],
})
export class AppModule {}
