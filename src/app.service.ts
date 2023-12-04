import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WordService } from './word/word.service';
import { UserService } from './user/user.service';
import { SessionService } from './session/session.service';
import { STATUS, SessionType, WordPosition } from './session/types';
import { AIService } from './ai/ai.service';
import { randomUUID } from 'crypto';

const MAX_ATTEMPT = 6;

@Injectable()
export class AppService {
  constructor(
    private wordService: WordService,
    private userService: UserService,
    private sessionService: SessionService,
    private readonly aiService: AIService,
  ) {}

  async startGame(userId: string): Promise<Partial<SessionType>> {
    try {
      // get userId by JWT - from auth service
      // const userId = 'check_userJWT';

      // if (!userId) throw new BadRequestException('User not found');

      // check JWT is valid or expired -> use auth service

      // check if user has active game session
      const activeSession = await this.sessionService.findActiveSessionByUser(
        userId,
      );

      // if yes, return existing game session
      if (activeSession) {
        return {
          userId,
          sessionId: activeSession.sessionId,
          attempts: activeSession.attempts,
          attemptsRemaining: activeSession.attemptsRemaining,
          status: activeSession.status,
        };
      }

      // temporary create new user - will be removed after auth service is done
      const { userId: newUserId } = await this.userService.create({
        email: `${randomUUID()}@abc.com`,
        password: '123456',
      });
      // if no, create new game session
      const wordToGuess = await this.wordService.random();

      return await this.sessionService.create({
        userId: newUserId,
        wordToGuess,
        attempts: [],
        attemptsRemaining: MAX_ATTEMPT,
        status: STATUS.PLAYING,
      });
    } catch (error) {
      throw new BadRequestException('Can not start new game, ' + error.message);
    }
  }

  async submitGuess(guess: string) {
    try {
      // get userId by JWT - from auth service
      const userId = '656d90995d45f2d5af870c5c';

      if (!userId) throw new BadRequestException('User not found');

      // check JWT is valid or expired -> use auth service
      const isUserValid = true;
      if (!isUserValid) throw new BadRequestException('User is not valid');

      // get the word to guess from session service
      const {
        sessionId,
        wordToGuess,
        attempts = [],
        attemptsRemaining = MAX_ATTEMPT,
      } = await this.sessionService.findActiveSessionByUser(userId);
      const newAttempts = this.calPosition(wordToGuess, guess, attempts);
      const newAttemptsRemaining = attemptsRemaining - 1;
      await this.sessionService.update(sessionId, {
        attempts: newAttempts,
        attemptsRemaining: newAttemptsRemaining,
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
      throw new BadRequestException(`Can not submit guess - ${e.message}`);
    }
  }

  async endGame() {
    try {
      // get userId by JWT - from auth service
      // check JWT is valid or expired -> use auth service
      const userId = '65192d0e16e9f892f21ea1cf-1';

      // get the sessionId with userId and status is PLAYING
      const { sessionId } = await this.sessionService.findActiveSessionByUser(
        userId,
      );

      // update status to ENDED
      return await this.sessionService.update(sessionId, {
        status: STATUS.ENDED,
      });
    } catch (error) {
      throw new BadRequestException('Can not end game');
    }
  }

  async getHints(sessionId: string): Promise<string[]> {
    const { wordToGuess } = await this.sessionService.getById(sessionId);
    if (!wordToGuess) throw new BadRequestException('Word not found');

    try {
      const response = await this.aiService.textCompletionCohere(wordToGuess);
      let hints: string;
      await response.forEach((value) => {
        const { generations } = value;
        hints = generations[0].text;
      });
      const startIndex = hints.indexOf('```');
      const endIndex = hints.lastIndexOf('```');
      const subString = hints.substring(startIndex + 7, endIndex);
      return JSON.parse(subString);
    } catch (error) {
      throw new BadRequestException('Can not get hints ', error.message);
    }
  }

  private calPosition(word: string, guess: string, attempts: WordPosition[]) {
    const green: string[] = [];
    const yellow: string[] = [];
    const black: string[] = [];
    for (let i = 0; i < word.length; i++) {
      const charWord = word[i];
      const charGuess = guess[i];
      if (charWord === charGuess) {
        green.push(charGuess);
      } else if (word.includes(charGuess)) {
        yellow.push(charGuess);
      } else {
        black.push(charGuess);
      }
    }
    return [...attempts, { green, yellow, black }];
  }
}
