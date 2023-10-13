import { Injectable, NotAcceptableException } from '@nestjs/common';
import { WordService } from './word/word.service';
import { UserService } from './user/user.service';
import { SessionService } from './session/session.service';
import { STATUS, SessionType } from './session/types';

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
      const userId = '65192d0e16e9f892f21ea1cf';

      // check JWT is valid or expired -> use auth service

      // check if user has active game session
      const activeSession = await this.sessionService.findActiveSessionByUser(
        userId,
      );

      // if yes, return existing game session
      if (activeSession) {
        return activeSession.toJSON();
      }

      // if no, create new game session
      const wordToGuess = await this.wordService.random();

      const newSession = {
        userId,
        wordToGuess,
        attempts: [],
        attemptsRemaining: MAX_ATTEMPT,
        status: STATUS.PLAYING,
      };

      await this.sessionService.create(newSession);
      delete newSession.wordToGuess;
      return newSession;
    } catch (error) {
      throw new NotAcceptableException('Can not start new game');
    }
  }

  async submitGuess() {
    return 'startGame';
  }

  async getGameResult() {
    return 'startGame';
  }
}
