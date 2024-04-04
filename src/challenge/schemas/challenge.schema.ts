import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Word } from 'src/word/schemas/word.schema';

export type ChallengeDocument = Challenge & Document;

export enum ChallengeType {
  DAILY = 'DAILY',
  CHALLENGE = 'CHALLENGE',
}

@Schema({ timestamps: true, versionKey: false })
export class Challenge {
  @Prop({ type: String, required: true, ref: Word.name })
  word: string;

  @Prop({ type: String, enum: ChallengeType, required: false, default: null })
  type: ChallengeType;

  @Prop()
  createdAt: Date;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
