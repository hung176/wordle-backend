import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Word, WordDocument } from './schemas/word.schema';
import { Model } from 'mongoose';

export type HintsType = { hints: string[] };
export type WordType = Pick<Word, 'word'>;
export type RandonWord = WordType & HintsType;

@Injectable()
export class WordService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
  ) {}

  async random(): Promise<RandonWord> {
    const count = await this.wordModel.count();
    const random = Math.floor(Math.random() * count);
    const { word } = await this.wordModel.findOne().skip(random);
    const { hints } = await this.getHints(word);
    return { word, hints };
  }

  async findAll(): Promise<WordType[]> {
    const all = await this.wordModel.find({}, { word: 1 });
    return all;
  }

  async getHints(word: string): Promise<HintsType> {
    const { word: wordHint } = await this.wordModel.findOne({ word });
    const hints = [];
    return { hints };
  }
}
