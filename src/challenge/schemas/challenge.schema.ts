import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Word } from 'src/word/schemas/word.schema';

export type ChallengeDocument = Challenge & Document;

export enum ChallengeType {
  DAILY = 'DAILY',
  CHALLENGE = 'CHALLENGE',
  INFINITE = 'INFINITE',
}

@Schema({ timestamps: true, versionKey: false })
export class Challenge {
  @Prop({ type: String, required: true, ref: Word.name })
  word: string;

  @Prop({ type: String, enum: ChallengeType, required: false, default: null })
  type: ChallengeType;

  @Prop({ type: Number, required: false, default: 0 })
  day?: number;

  @Prop({ type: Number, required: false })
  year?: number;

  @Prop({ type: Boolean, required: false, default: false })
  expired?: boolean;

  @Prop()
  createdAt: Date;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
