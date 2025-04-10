import { Global, Module } from '@nestjs/common';
import { GoogleAIService } from './genai.service';

@Global()
@Module({
  providers: [GoogleAIService],
  exports: [GoogleAIService],
})
export class GoogleAIModule {}
