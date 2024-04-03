import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Challenge.name, schema: ChallengeSchema }])],
  providers: [],
  exports: [],
})
export class ChallengeModule {}
