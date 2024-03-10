import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './word/schemas/word.schema';
import { WordsSeeder } from './seeders/words.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/config';

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('dbConnectionString');
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }]),
  ],
}).run([WordsSeeder]);
