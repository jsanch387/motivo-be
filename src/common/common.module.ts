import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService], // 👈 Make sure to export it
})
export class CommonModule {}
