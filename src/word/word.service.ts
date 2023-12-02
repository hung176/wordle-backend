import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Word, WordDocument } from './schemas/word.schema';
import { Model } from 'mongoose';

export type WordType = Pick<Word, 'word'>;

@Injectable()
export class WordService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
  ) {}

  async random(): Promise<WordType> {
    const count = await this.wordModel.count();
    const random = Math.floor(Math.random() * count);
    const { word } = await this.wordModel.findOne().skip(random);
    return { word };
  }

  async findAll(): Promise<WordType[]> {
    const all = await this.wordModel.find({}, { word: 1 });
    return all;
  }
}
