export enum STATUS {
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export type SessionType = {
  sessionId?: string;
  userId: string;
  wordToGuess: string;
  attemptsRemaining: number;
  attempts: string[];
  status: STATUS;
};
