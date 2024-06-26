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
      const session = await this.sessionService.getSessionById(sessionId);

      // if session is not existed, and dailyMode is true, get word from daily challenge
      if (!session && dailyMode) {
        const challenge = await this.challengeService.getWordForDailyChallenge();
        if (!challenge) {
          throw new BadRequestException('Challenge not found');
        }
        const wordToGuess = challenge.word;

        if (!wordToGuess) {
          throw new BadRequestException('Word not found');
        }

        return await this.sessionService.create({
          wordToGuess,
          challengeId: challenge._id,
          challengeType: ChallengeType.DAILY,
          attempts: [],
          attemptsRemaining: MAX_ATTEMPT,
          status: STATUS.PLAYING,
        });
      }

      // if session is not existed, and dailyMode is false, get random word
      if (!session && !dailyMode) {
        const wordToGuess = await this.wordService.random();
        return await this.sessionService.create({
          wordToGuess,
          attempts: [],
          attemptsRemaining: MAX_ATTEMPT,
          status: STATUS.PLAYING,
        });
      }

      // session is existed, but it is in challenge mode, crete new session with norlmal mode
      if (session && session.challengeType === ChallengeType.CHALLENGE) {
        const wordToGuess = await this.wordService.random();
        return await this.sessionService.create({
          wordToGuess,
          attempts: [],
          attemptsRemaining: MAX_ATTEMPT,
          status: STATUS.PLAYING,
        });
      }

      const responseSession = {
        sessionId: session._id,
        attempts: session.attempts,
        challengeId: session.challengeId,
        challengeType: session.challengeType,
        attemptsRemaining: session.attemptsRemaining,
        status: session.status,
        keyboardColor: session.keyboardColor,
        hints: session.hints,
      };

      // if session is existed, return the session
      const isGameOver =
        session.status === STATUS.ENDED || session.status === STATUS.SUCCESS || session.status === STATUS.FAILED;
      if (isGameOver) {
        return {
          ...responseSession,
          wordToGuess: session.wordToGuess,
        };
      }
      return responseSession;
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

  async startChallenge(challengeId: string, sessionId: string | null): Promise<SessionResponse> {
    try {
      const challenge = await this.challengeService.getChallengeById(challengeId);
      if (!challenge) {
        throw new BadRequestException('Challenge not found');
      }
      const { word } = challenge;

      const session = await this.sessionService.getSessionChallenge(sessionId, challengeId);
      if (session) {
        if (session.status === STATUS.ENDED || session.status === STATUS.SUCCESS || session.status === STATUS.FAILED) {
          return session;
        }
        return {
          sessionId: session._id,
          challengeId: session.challengeId,
          challengeType: session.challengeType,
          attempts: session.attempts,
          attemptsRemaining: session.attemptsRemaining,
          status: session.status,
          keyboardColor: session.keyboardColor,
          hints: session.hints,
        };
      }

      return await this.sessionService.create({
        wordToGuess: word,
        challengeId,
        challengeType: ChallengeType.CHALLENGE,
        attempts: [],
        attemptsRemaining: MAX_ATTEMPT,
        status: STATUS.PLAYING,
      });
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('Can not start challenge');
    }
  }

  async validWords(): Promise<string[]> {
    return this.wordService.findAll();
  }

  async submitChallenge(word: string): Promise<{ challengeId: string }> {
    if (typeof word !== 'string') {
      throw new BadRequestException('Word must be a string');
    }
    if (word.length !== 5) {
      throw new BadRequestException('Word must have 5 characters');
    }
    if (!/^[a-zA-Z]+$/.test(word)) {
      throw new BadRequestException('Word must contain only letters');
    }
    const wordLowerCase = word.toLowerCase();
    const challengeByWord = await this.challengeService.getChallengeByWord(wordLowerCase, ChallengeType.CHALLENGE);
    if (challengeByWord) {
      return { challengeId: challengeByWord._id };
    }

    const challenge = await this.challengeService.createChallenge(wordLowerCase);
    return { challengeId: challenge._id };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Ho_Chi_Minh' })
  async createDailyChallenge(): Promise<boolean> {
    const year = new Date().getFullYear();

    try {
      const challengesDaily = (await this.challengeService.getChallengeByType(ChallengeType.DAILY)) || [];
      const latestDay = challengesDaily[0]?.day || 0;
      const allWords = (await this.wordService.findAll()) || [];
      const wordsDone = challengesDaily.map((challenge) => challenge.word);
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
