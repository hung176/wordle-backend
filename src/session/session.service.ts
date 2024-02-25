import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { STATUS, SessionResponse, SessionType } from './types';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionService {
  constructor(@InjectModel(Session.name) private sessionModel: Model<SessionDocument>) {}

  async create(session: CreateSessionDto): Promise<SessionResponse> {
    const sessionCreated = await this.sessionModel.create(session);

    return {
      sessionId: sessionCreated._id,
      attempts: sessionCreated.attempts,
      attemptsRemaining: sessionCreated.attemptsRemaining,
      status: sessionCreated.status,
      keyboardColor: sessionCreated.keyboardColor,
      hints: sessionCreated.hints,
    };
  }

  async getSessionById(sessionId: string) {
    const session = await this.sessionModel.findOne({ _id: sessionId }).lean();
    if (!session) {
      return null;
    }
    return session;
  }

  async getSessionByUserId(userId: string) {
    return await this.sessionModel.find({ userId }).lean();
  }

  async update(id: string, updateData: Partial<SessionType>) {
    const updatedSession = await this.sessionModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).lean();
    if (!updatedSession) {
      return null;
    }
    const sessionWithOutWord = {
      sessionId: updatedSession._id,
      attempts: updatedSession.attempts,
      attemptsRemaining: updatedSession.attemptsRemaining,
      status: updatedSession.status,
      keyboardColor: updatedSession.keyboardColor,
      hints: updatedSession.hints,
    };
    if (
      updatedSession.status === STATUS.ENDED ||
      updatedSession.status === STATUS.SUCCESS ||
      updatedSession.status === STATUS.FAILED
    ) {
      return {
        ...sessionWithOutWord,
        wordToGuess: updatedSession.wordToGuess,
      };
    }
    return sessionWithOutWord;
  }
}
