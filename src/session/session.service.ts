import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { STATUS, SessionType } from './types';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async create(session: CreateSessionDto): Promise<SessionDocument> {
    return await this.sessionModel.create(session);
  }

  async getSessionById(sessionId: string) {
    return await this.sessionModel.findOne({ _id: sessionId }).lean();
  }

  async getSessionByUserId(userId: string) {
    return await this.sessionModel.find({ userId }).lean();
  }

  async findActiveSessionByUser(userId: string) {
    const session = await this.sessionModel
      .findOne({
        userId,
        status: STATUS.PLAYING,
      })
      .lean();

    if (!session) {
      return null;
    }

    return {
      sessionId: session._id,
      attempts: session.attempts,
      attemptsRemaining: session.attemptsRemaining,
      status: session.status,
      wordToGuess: session.wordToGuess,
      keyboardColor: session.keyboardColor,
    };
  }

  async update(id: string, updateData: Partial<SessionType>) {
    const session = await this.sessionModel
      .findOneAndUpdate({ _id: id }, updateData, { new: true })
      .lean();

    return {
      sessionId: session._id,
      attempts: session.attempts,
      attemptsRemaining: session.attemptsRemaining,
      status: session.status,
      keyboardColor: session.keyboardColor,
    };
  }
}
