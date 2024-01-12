import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WordService } from './word/word.service';
import { UserService } from './user/user.service';
import { SessionService } from './session/session.service';
import { STATUS, SessionResponse } from './session/types';
import { AIService } from './ai/ai.service';
import { randomUUID } from 'crypto';
import { WordGuessDto } from './app.dto';
import { calculateLetterEachRow, calculateLetterKeyBoard } from './utils';

const MAX_ATTEMPT = 6;

@Injectable()
export class AppService {
  constructor(
    private wordService: WordService,
    private userService: UserService,
    private sessionService: SessionService,
    private readonly aiService: AIService,
  ) {}

  async startGame(userIdReal: string): Promise<SessionResponse> {
    try {
      const userId = '6599757b2415f6d4633517a6';
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
          keyboardColor: activeSession.keyboardColor,
        };
      }

      // temporary create new user - will be removed after auth service is done
      const { userId: newUserId } = await this.userService.create({
        email: `${randomUUID()}@abc.com`,
        password: '123456',
      });
      // if no, create new game session
      const wordToGuess = await this.wordService.random();

      const sessionCreated = await this.sessionService.create({
        userId: newUserId,
        wordToGuess,
        attempts: [],
        attemptsRemaining: MAX_ATTEMPT,
        status: STATUS.PLAYING,
      });
      return {
        sessionId: sessionCreated._id,
        userId: sessionCreated.userId,
        attempts: sessionCreated.attempts,
        attemptsRemaining: sessionCreated.attemptsRemaining,
        status: sessionCreated.status,
        keyboardColor: sessionCreated.keyboardColor,
      };
    } catch (error) {
      throw new BadRequestException('Can not start new game, ' + error.message);
    }
  }

  async submitGuess({
    sessionId,
    guess,
  }: WordGuessDto): Promise<SessionResponse> {
    try {
      // check the guess is valid english word
      // const isEnglishWord = await this.wordService.isEnglishWord(guess);

      // if (!isEnglishWord) {
      //   throw new BadRequestException('Invalid guess');
      // }

      const {
        wordToGuess,
        attempts = [],
        attemptsRemaining = MAX_ATTEMPT,
      } = await this.sessionService.getSessionById(sessionId);
      const newAttempts = [
        ...attempts,
        calculateLetterEachRow(wordToGuess, guess),
      ];
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
    const { wordToGuess } = await this.sessionService.getSessionById(sessionId);
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
}
