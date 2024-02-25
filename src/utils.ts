import { KeyboardColor, Attempt } from './session/types';

export function calculateLetterEachRow(word: string, guess: string): Attempt {
  const result = guess.split('').map((char: string, index: number) => ({
    letter: char,
    position: index,
    green: char === word[index],
    yellow: char !== word[index] && word.includes(char),
    gray: char !== word[index] && !word.includes(char),
  }));

  return result;
}

export function calculateLetterKeyBoard(attempts: Attempt[]): KeyboardColor {
  const result: KeyboardColor = {};

  const getLetterByColor = (color: string) =>
    attempts.map((attempt) => attempt.filter((letter) => letter[color]).map(({ letter }) => letter)).flat();
  const green = getLetterByColor('green');
  const yellow = getLetterByColor('yellow');
  const gray = getLetterByColor('gray');

  for (const char of green) {
    if (!result[char]) {
      result[char] = 'green';
    }
  }

  for (const char of gray) {
    if (!result[char]) {
      result[char] = 'gray';
    }
  }

  for (const char of yellow) {
    if (!result[char]) {
      result[char] = 'yellow';
    }
  }

  return result;
}
