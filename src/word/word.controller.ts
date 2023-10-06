import { Controller, Get } from '@nestjs/common';
import { WordService } from './word.service';
import { Word } from './schemas/word.schema';

@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  async getAll(): Promise<Word[]> {
    return await this.wordService.findAll();
  }

  @Get('random')
  async getRandom(): Promise<Word> {
    return await this.wordService.random();
  }
}
