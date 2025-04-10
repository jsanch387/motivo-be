// src/common/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // 👈 This makes it available globally
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService], // 👈 So other modules can use it
})
export class DatabaseModule {}
