import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge, ChallengeDocument } from './schemas/challenge.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChallengeService {
  constructor(@InjectModel(Challenge.name) private challengeModel: Model<ChallengeDocument>) {}

  async create(word: string): Promise<ChallengeDocument> {
    return await this.challengeModel.create({ word });
  }
}
