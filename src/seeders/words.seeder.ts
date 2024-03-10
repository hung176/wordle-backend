import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder } from 'nestjs-seeder';
import { Word } from 'src/word/schemas/word.schema';
import wordsData from '../data/words.json';

@Injectable()
export class WordsSeeder implements Seeder {
  constructor(@InjectModel(Word.name) private readonly word: Model<Word>) {}

  async seed(): Promise<any> {
    return this.word.insertMany(wordsData);
  }

  async drop(): Promise<any> {
    return this.word.deleteMany({});
  }
}
