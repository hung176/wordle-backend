import { Key } from 'readline';
import { KeyboardColor, WordPosition } from './session/types';

export function calculateLetterEachRow(
  word: string,
  guess: string,
  attempts: WordPosition[],
): WordPosition[] {
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
  return [...attempts, { guess, green, yellow, black }];
}

export function calculateLetterKeyBoard(
  attempts: WordPosition[],
): KeyboardColor {
  const result: KeyboardColor = {};

  const green = attempts.map((attempt) => attempt.green).flat();
  const yellow = attempts.map((attempt) => attempt.yellow).flat();
  const black = attempts.map((attempt) => attempt.black).flat();

  for (const char of green) {
    if (!result[char]) {
      result[char] = 'green';
    }
  }

  for (const char of black) {
    if (!result[char]) {
      result[char] = 'black';
    }
  }

  for (const char of yellow) {
    if (!result[char]) {
      result[char] = 'yellow';
    }
  }

  return result;
}
