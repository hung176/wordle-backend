import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true, versionKey: false })
export class Session {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;

  @Prop()
  wordToGuess: string;

  @Prop()
  attemptsRemaining: number;

  @Prop()
  attempts: string[];

  @Prop()
  result: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
