import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { KeyboardColor, STATUS, Attempt } from '../types';
import { Challenge, ChallengeType } from 'src/challenge/schemas/challenge.schema';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true, versionKey: false })
export class Session {
  // @Prop({ type: String, required: true, ref: User.name })
  // userId: string;

  @Prop({ type: String, required: true })
  wordToGuess: string;

  @Prop({ type: [String], required: false })
  hints: string[];

  @Prop()
  attemptsRemaining: number;

  @Prop()
  attempts: Attempt[];

  @Prop()
  status: STATUS;

  @Prop({ type: Object })
  keyboardColor: KeyboardColor;

  @Prop({ type: String, required: false, ref: Challenge.name })
  challengeId?: string;

  @Prop({ type: String, required: false, default: ChallengeType.INFINITE })
  challengeType?: ChallengeType;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
