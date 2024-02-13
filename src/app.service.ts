import { BadRequestException, Injectable } from '@nestjs/common';
import { WordService } from './word/word.service';
import { UserService } from './user/user.service';
import { SessionService } from './session/session.service';
import { STATUS, SessionResponse } from './session/types';
import { AIService } from './ai/ai.service';
import { WordGuessDto } from './app.dto';
import { calculateLetterEachRow, calculateLetterKeyBoard } from './utils';

const MAX_ATTEMPT = 6;

@Injectable()
export class AppService {
  constructor(
    private wordService: WordService,
    private userService: UserService,
    private sessionService: SessionService,
    private readonly aiService: AIService
  ) {}

  async startGame(sessionId: string | undefined): Promise<SessionResponse> {
    try {
      if (!sessionId) {
        const wordToGuess = await this.wordService.random();
        return await this.sessionService.create({
          wordToGuess,
          attempts: [],
          attemptsRemaining: MAX_ATTEMPT,
          status: STATUS.PLAYING,
        });
      }

      return await this.sessionService.getSessionById(sessionId);
    } catch (error) {
      throw new BadRequestException('Can not start new game, ' + error.message);
    }
  }

  async submitGuess({ sessionId, guess }: WordGuessDto): Promise<SessionResponse> {
    try {
      const isEnglishWord = await this.wordService.isEnglishWord(guess);

      if (!isEnglishWord) {
        throw new BadRequestException('Word is not in the list');
      }

      const {
        wordToGuess,
        attempts = [],
        attemptsRemaining = MAX_ATTEMPT,
      } = await this.sessionService.getSessionById(sessionId);
      const newAttempts = [...attempts, calculateLetterEachRow(wordToGuess, guess)];
      const newAttemptsRemaining = attemptsRemaining - 1;

      // before update, calculate what color each character in keyboard
      const keyboardColor = calculateLetterKeyBoard(newAttempts);
      await this.sessionService.update(sessionId, {
        attempts: newAttempts,
        attemptsRemaining: newAttemptsRemaining,
        keyboardColor,
      });

      // compare the word to guess with the submitted word
      // if the word is correct, update status to COMPLETED, update attemps, attemptsRemaining and return result
      if (wordToGuess === guess) {
        return await this.sessionService.update(sessionId, {
          status: STATUS.SUCCESS,
        });
      }

      // if the word is incorrect, update attempts, attemptsRemaining
      // if attemptsRemaining is 0, update status to FAILED
      if (newAttemptsRemaining === 0) {
        return await this.sessionService.update(sessionId, {
          status: STATUS.FAILED,
        });
      }

      // if attemptsRemaining is not 0, status is PLAYING
      if (newAttemptsRemaining > 0) {
        return await this.sessionService.update(sessionId, {
          status: STATUS.PLAYING,
        });
      }

      // if attemptsRemaining is not 0, but session is expired, update status to EXPIRED
      return await this.sessionService.update(sessionId, {
        status: STATUS.ENDED,
      });
    } catch (e) {
      console.log('error', e);
      throw new BadRequestException(`Can not submit guess - ${e.message}`);
    }
  }

  async endGame(sessionId: string) {
    try {
      return await this.sessionService.update(sessionId, {
        status: STATUS.ENDED,
      });
    } catch (error) {
      throw new BadRequestException('Can not end game');
    }
  }

  async getHints(sessionId: string): Promise<string> {
    const { wordToGuess, hints } = await this.sessionService.getSessionById(sessionId);
    if (!wordToGuess) throw new BadRequestException('Word not found');

    try {
      const response = await this.aiService.textCompletionCohere(wordToGuess);
      let hint: string;
      await response.forEach((value) => {
        const { generations } = value;
        hint = generations[0].text;
      });

      await this.sessionService.update(sessionId, {
        hints: [...hints, hint],
      });

      return hint;
    } catch (error) {
      throw new BadRequestException('Can not get hints ', error.message);
    }
  }

  // async reveal(sessionId: string): Promise<{ letter: string; position: number }> {
  //   const { wordToGuess = '', attempts } = await this.sessionService.getSessionById(sessionId);

  //   const isRevealed = (letterInput: string, pos: number) =>
  //     attempts.some((attempt) =>
  //       attempt.some(({ letter, position, green }) => letterInput === letter && pos === position && green)
  //     );

  //   for (let i = 0; i < wordToGuess.length; i++) {
  //     if (!isRevealed(wordToGuess[i], i)) {
  //       return { letter: wordToGuess[i], position: i };
  //     }
  //   }

  //   return null;
  // }
}
