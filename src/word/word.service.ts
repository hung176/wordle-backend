import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Word, WordDocument } from './schemas/word.schema';
import { Model } from 'mongoose';

@Injectable()
export class WordService {
  constructor(@InjectModel(Word.name) private readonly wordModel: Model<WordDocument>) {}

  async random(): Promise<string> {
    const count = await this.wordModel.count();
    const random = Math.floor(Math.random() * count);
    const { word } = await this.wordModel.findOne().skip(random);
    return word;
  }

  async findAll(): Promise<string[]> {
    const all = await this.wordModel.find({}, { word: 1 });
    return all.map(({ word }) => word);
  }

  async getWordForToday(): Promise<Word> {
    const dayOfYear = this.getDayOfYear();
    console.log('dayOfYear', dayOfYear);
    const word = await this.wordModel
      .findOne()
      .skip(dayOfYear - 1)
      .exec();
    return word;
  }

  private getDayOfYear(date: Date = new Date()): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
}
