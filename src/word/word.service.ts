import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Word, WordDocument } from './schemas/word.schema';
import { Model } from 'mongoose';

@Injectable()
export class WordService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
  ) {}

  async random(): Promise<string> {
    const count = await this.wordModel.count();
    const random = Math.floor(Math.random() * count);
    return (await this.wordModel.findOne().skip(random)).word;
  }

  async findAll() {
    const all = await this.wordModel.find();
    return all;
  }
}
