import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WordModule } from './word/word.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('dbConnectionString');
        const dbName = configService.get<string>('dbName');
        return {
          uri,
          dbName,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    WordModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
