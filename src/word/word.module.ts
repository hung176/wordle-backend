import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './schemas/word.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }])],
  controllers: [],
  providers: [WordService],
  exports: [WordService],
})
export class WordModule {}
