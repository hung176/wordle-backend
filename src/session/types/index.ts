export enum STATUS {
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export type SessionType = {
  userId: string;
  wordToGuess: string;
  attemptsRemaining: number;
  attempts: string[];
  status: STATUS;
};
