import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable, map } from 'rxjs';

@Injectable()
export class AIService {
  constructor(
    @Inject(HttpService) private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private get aiCortextUrl(): string {
    return this.configService.get<string>('aiCortextUrl');
  }

  private get aiCortextApiKey(): string {
    return this.configService.get<string>('aiCortextApiKey');
  }

  async textCompletion(
    text: string,
    length = 2,
  ): Promise<Observable<AxiosResponse<any>>> {
    const url = `${this.aiCortextUrl}/texts/completions`;
    const textCompletion = `
      You will be provided with text delimited by triple quotes.
      If it contains a english word, you will be asked to provide some hints
      for that word to help the user guess the word in wordle game.
      Your task is to provide ${length} hints for english word with json format as below:
      ["<hint1>", "<hint2>", "<hint3>", ....]
      The word is """${text}"""
    `;
    return await this.httpService
      .post(
        url,
        {
          augment: null,
          max_tokens: 512,
          model: 'chat-sophos-1',
          n: 1,
          source_lang: 'en',
          target_lang: 'en',
          temperature: 0.65,
          text: textCompletion,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${this.aiCortextApiKey}`,
          },
        },
      )
      .pipe(map((response) => response.data));
  }
}
