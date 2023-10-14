export enum STATUS {
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export type WordPosition = {
  green: string[];
  yellow: string[];
};

export type SessionType = {
  sessionId?: string;
  userId: string;
  wordToGuess: string;
  attemptsRemaining: number;
  attempts: WordPosition[];
  status: STATUS;
};
