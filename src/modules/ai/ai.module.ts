import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAIModule } from 'src/common/openai/openai.module';

@Module({
  imports: [OpenAIModule], // ✅ import the OpenAIModule so AiService can use OpenAIService
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
