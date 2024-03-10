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

  async isEnglishWord(word: string): Promise<boolean> {
    const count = await this.wordModel.count({ word });
    return count > 0;
  }
}
