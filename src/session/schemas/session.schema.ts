import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { STATUS, WordPosition } from '../types';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true, versionKey: false })
export class Session {
  @Prop({ type: String, required: true, ref: User.name })
  userId: string;

  @Prop()
  wordToGuess: string;

  @Prop()
  attemptsRemaining: number;

  @Prop()
  attempts: WordPosition[];

  @Prop()
  status: STATUS;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
