export enum STATUS {
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  // FAILED means the user has no attempt remaining
  FAILED = 'FAILED',
  // ENDED means the session is expired or user end the game
  ENDED = 'ENDED',
}

export type WordPosition = {
  guess: string;
  green: string[];
  yellow: string[];
  black: string[];
};

export type SessionType = {
  sessionId: string;
  userId: string;
  wordToGuess: string;
  attemptsRemaining: number;
  attempts: WordPosition[];
  status: STATUS;
  keyboardColor: KeyboardColor;
};

export type KeyboardColor = {
  [key: string]: string;
};

export type SessionResponse = Partial<SessionType>;
