import { BadRequestException, Injectable } from '@nestjs/common';
import { WordService } from './word/word.service';
import { UserService } from './user/user.service';
import { SessionService } from './session/session.service';
import { STATUS, SessionResponse } from './session/types';
import { AIService } from './ai/ai.service';
import { WordGuessDto } from './app.dto';
import { calculateLetterEachRow, calculateLetterKeyBoard, getDayYear } from './utils';
import { ChallengeService } from './challenge/challenge.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Challenge, ChallengeDocument, ChallengeType } from './challenge/schemas/challenge.schema';

const MAX_ATTEMPT = 6;
@Injectable()
export class AppService {
  constructor(
    private wordService: WordService,
    private userService: UserService,
    private sessionService: SessionService,
    private readonly aiService: AIService,
    private challengeService: ChallengeService
  ) {}

  async startGame(sessionId: string | null, dailyMode?: boolean): Promise<SessionResponse> {
    try {
      if (dailyMode) {
        const challenge = await this.challengeService.getChallengeByType(ChallengeType.DAILY);
        if (challenge.length > 0) {
          const wordToGuess = challenge[0]?.word;

          if (!wordToGuess) {
            throw new BadRequestException('Word not found');
          }

          return await this.sessionService.create({
            wordToGuess,
            challengeId: challenge[0]._id,
            attempts: [],
            attemptsRemaining: MAX_ATTEMPT,
            status: STATUS.PLAYING,
          });
        }
      }

      const session = await this.sessionService.getSessionById(sessionId);

      if (!sessionId || !session) {
        const wordToGuess = await this.wordService.random();
        return await this.sessionService.create({
          wordToGuess,
          attempts: [],
          attemptsRemaining: MAX_ATTEMPT,
          status: STATUS.PLAYING,
        });
      }

      if (session.status === STATUS.ENDED || session.status === STATUS.SUCCESS || session.status === STATUS.FAILED) {
        return {
          sessionId: session._id,
          attempts: session.attempts,
          attemptsRemaining: session.attemptsRemaining,
          status: session.status,
          keyboardColor: session.keyboardColor,
          hints: session.hints,
          wordToGuess: session.wordToGuess,
        };
      }
      return {
        sessionId: session._id,
        attempts: session.attempts,
        attemptsRemaining: session.attemptsRemaining,
        status: session.status,
        keyboardColor: session.keyboardColor,
        hints: session.hints,
      };
    } catch (error) {
      throw new BadRequestException('Can not start new game, ' + error.message);
    }
  }

  async submitGuess({ sessionId, guess }: WordGuessDto): Promise<SessionResponse> {
    try {
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
      const session = await this.sessionService.getSessionById(sessionId);
      const isGameOver = session && (session.status === STATUS.SUCCESS || session.status === STATUS.FAILED);
      if (isGameOver) {
        return session;
      }
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

  async startChallenge(challengeId: string): Promise<ChallengeDocument> {
    const challenge = await this.challengeService.getChallengeById(challengeId);

    if (!challenge) {
      throw new BadRequestException('Challenge not found');
    }

    return challenge;
  }

  async validWords(): Promise<string[]> {
    return this.wordService.findAll();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Ho_Chi_Minh' })
  async createDailyChallenge(): Promise<boolean> {
    const year = new Date().getFullYear();

    try {
      const challengesDaily = (await this.challengeService.getChallengeByType(ChallengeType.DAILY)) || [];
      const latestDay = challengesDaily[0]?.day || 0;
      const allChallenges = (await this.challengeService.getAll()) || [];
      const wordsDone = challengesDaily.map((challenge) => challenge.word);
      const allWords = allChallenges.map((challenge) => challenge.word);
      const words = allWords.filter((word) => !wordsDone.includes(word));
      const word = words[Math.floor(Math.random() * words.length)];
      if (word) {
        await this.challengeService.createDailyChallenge({ word, type: ChallengeType.DAILY, day: latestDay + 1, year });
      }
    } catch (error) {
      throw new BadRequestException('Can not create daily challenge');
    }

    return true;
  }
}
