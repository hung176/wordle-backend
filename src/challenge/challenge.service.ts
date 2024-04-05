import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge, ChallengeDocument, ChallengeType } from './schemas/challenge.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChallengeService {
  constructor(@InjectModel(Challenge.name) private challengeModel: Model<ChallengeDocument>) {}

  async create(word: string, type: ChallengeType): Promise<ChallengeDocument> {
    return await this.challengeModel.create({ word, type });
  }

  async getChallengeById(challengeId: string) {
    return await this.challengeModel.findOne({ _id: challengeId }).lean();
  }

  async getChallengeByWord(word: string) {
    return await this.challengeModel.findOne({ word }).lean();
  }

  async getChallengeByType(type: ChallengeType) {
    return await this.challengeModel.find({ type }).lean();
  }

  async update(id: string, updateData: any) {
    return await this.challengeModel.findOneAndUpdate({ _id: id }, updateData, { new: false }).lean();
  }

  async delete(id: string) {
    return await this.challengeModel.deleteOne({ _id: id });
  }

  async createOrUpdate(word: string): Promise<ChallengeDocument> {
    const challenge = await this.getChallengeByType(ChallengeType.DAILY);
    if (Array.isArray(challenge) && challenge.length > 0) {
      const daily = challenge[0];
      return await this.update(daily._id, { word });
    }
    return await this.create(word, ChallengeType.DAILY);
  }
}
