import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge, ChallengeDocument, ChallengeType } from './schemas/challenge.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChallengeService {
  constructor(@InjectModel(Challenge.name) private challengeModel: Model<ChallengeDocument>) {}

  async createDailyChallenge({
    word,
    type,
    day,
    year,
  }: {
    word: string;
    type?: ChallengeType;
    day?: number;
    year?: number;
  }): Promise<ChallengeDocument> {
    // set latest challenge as expired
    const latestChallenge = await this.challengeModel.findOne({ type, expired: false });
    if (latestChallenge) {
      await this.challengeModel.updateOne({ _id: latestChallenge._id }, { expired: true });
    }
    return await this.challengeModel.create({ word, type, day, year });
  }

  async getAll() {
    return await this.challengeModel.find({}).lean();
  }

  async getChallengeById(challengeId: string) {
    return await this.challengeModel.findOne({ _id: challengeId }).lean();
  }

  async getChallengeByWord(word: string) {
    return await this.challengeModel.findOne({ word }).lean();
  }

  async getChallengeByType(type: ChallengeType) {
    return await this.challengeModel.find({ type }).sort({ year: -1 }).sort({ day: -1 }).lean();
  }

  async getWordForDailyChallenge() {
    const challenge = await this.challengeModel.findOne({ type: ChallengeType.DAILY, expired: false });
    if (!challenge) {
      return null;
    }
    return challenge;
  }

  async update(id: string, updateData: any) {
    return await this.challengeModel.findOneAndUpdate({ _id: id }, updateData, { new: false }).lean();
  }

  async delete(id: string) {
    return await this.challengeModel.deleteOne({ _id: id });
  }
}
