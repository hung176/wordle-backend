import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { STATUS, SessionType } from './types';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async create(session: SessionType) {
    return await this.sessionModel.create(session);
  }

  async getById(sessionId: string) {
    return await this.sessionModel.findOne({ _id: sessionId });
  }

  async getByUserId(userId: string) {
    return await this.sessionModel.find({ userId });
  }

  async findActiveSessionByUser(userId: string) {
    return await this.sessionModel.findOne(
      {
        userId,
        status: STATUS.PLAYING,
      },
      { wordToGuess: 0, __v: 0, _id: 0 },
    );
  }

  async update(id: string, updateData: Partial<SessionType>) {
    const session = await this.getById(id);
    const updatedSession = { ...session, ...updateData };
    return await this.sessionModel.updateOne({ _id: id }, updatedSession);
  }
}
