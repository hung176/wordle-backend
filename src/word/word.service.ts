import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Word, WordDocument } from './schemas/word.schema';
import { Model } from 'mongoose';

export type RandonWord = Pick<Word, 'word' | 'hints'>;

@Injectable()
export class WordService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
  ) {}

  async random(): Promise<RandonWord> {
    const count = await this.wordModel.count();
    const random = Math.floor(Math.random() * count);
    const { word, hints } = await this.wordModel.findOne().skip(random);
    return { word, hints };
  }

  async findAll(): Promise<RandonWord[]> {
    const all = await this.wordModel.find({}, { word: 1, hints: 1 });
    return all;
  }
}
