import { BadRequestException, Injectable } from '@nestjs/common';
import { WordService } from './word/word.service';
import { UserService } from './user/user.service';
import { SessionService } from './session/session.service';
import { STATUS, SessionType, WordPosition } from './session/types';

const MAX_ATTEMPT = 6;

@Injectable()
export class AppService {
  constructor(
    private wordService: WordService,
    private userService: UserService,
    private sessionService: SessionService,
  ) {}

  async startGame(): Promise<Partial<SessionType>> {
    try {
      // get userId by JWT - from auth service
      const userId = '65192d0e16e9f892f21ea1cf-1';

      if (!userId) throw new BadRequestException('User not found');

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

      // if no, create new game session
      const wordToGuess = await this.wordService.random();

      return await this.sessionService.create({
        userId,
        wordToGuess,
        attempts: [],
        attemptsRemaining: MAX_ATTEMPT,
        status: STATUS.PLAYING,
      });
    } catch (error) {
      throw new BadRequestException('Can not start new game');
    }
  }

  async submitGuess(guess: string) {
    // get userId by JWT - from auth service
    const userId = '65192d0e16e9f892f21ea1cf-1';

    // check JWT is valid or expired -> use auth service

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
      status: STATUS.EXPIRED,
    });

    // Note: handle the case that the word includes duplicate letters
  }

  async getGameResult() {
    return 'startGame';
  }

  async endGame() {
    return 'endGame';
  }

  private calPosition(word: string, guess: string, attempts: WordPosition[]) {
    const green: string[] = [];
    const yellow: string[] = [];
    for (let i = 0; i < word.length; i++) {
      const charWord = word[i];
      const charGuess = guess[i];
      if (charWord === charGuess) {
        green.push(charGuess);
      } else if (word.includes(charGuess)) {
        yellow.push(charGuess);
      }
    }
    return [...attempts, { green, yellow }];
  }
}
