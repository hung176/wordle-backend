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

  private get aiCohereUrl(): string {
    return this.configService.get<string>('aiCohereUrl');
  }

  private get aiCohereApiKey(): string {
    return this.configService.get<string>('aiCohereApiKey');
  }

  async textCompletionCortext(
    text: string,
    size = 3,
  ): Promise<Observable<AxiosResponse<any>>> {
    const url = `${this.aiCortextUrl}/texts/completions`;
    const textCompletion = `
      You will be provided with text delimited by triple quotes.
      If it contains a english word, you will be asked to provide some hints
      for that word to help the user guess the word in wordle game.
      Your task is to provide ${size} hints for english word with json format as below:
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

  async textCompletionCohere(text: string) {
    const url = `${this.aiCohereUrl}/v1/generate`;
    const textCompletion = `
      You will be provided with text delimited by triple quotes.
      You will be asked to provide only one hint
      for that word to help the user guess the word in wordle game.
      Your task is to generate one hint for this word with format as below:
      "The hint for the word is <hint>".
      The word is """${text}"""
      Important: Please provide only one hint and do not mention the word in the text response.
    `;

    return await this.httpService
      .post(
        url,
        {
          k: 0,
          max_tokens: 300,
          model: 'command',
          prompt: textCompletion,
          raw_prompting: false,
          return_likelihoods: 'NONE',
          stop_sequences: [],
          temperature: 0.9,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${this.aiCohereApiKey}`,
          },
        },
      )
      .pipe(map((response) => response.data));
  }
}
