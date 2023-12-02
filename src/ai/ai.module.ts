import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AIService } from './ai.service';

@Module({
  imports: [HttpModule],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
