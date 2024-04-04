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

  async update(id: string, updateData: any) {
    return await this.challengeModel.findOneAndUpdate({ _id: id }, updateData, { new: false }).lean();
  }

  async delete(id: string) {
    return await this.challengeModel.deleteOne({ _id: id });
  }

  async createOrUpdate(word: string, type: ChallengeType): Promise<ChallengeDocument> {
    const challenge = await this.getChallengeByWord(word);
    if (challenge) {
      return await this.update(challenge._id, { type });
    }
    return await this.create(word, type);
  }
}
