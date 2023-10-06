import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller()
export class AppController {
  @Post('start')
  async startGame() {
    return 'startGame';
    /*
      This endpoint is used to start a new game session.
      When a user wants to begin a new game, they make a request to this endpoint.
      The backend generates a new game session, selects a random word, initializes game-related data (e.g., number of attempts), and returns an initial response to the user.
      It typically returns data like the initial state of the game, such as the number of attempts allowed and any other necessary information.
     */
  }

  @Post('guess')
  async submitGuess(@Body() guess: string) {
    console.log(guess);
    return 'submitGuess';
    /*
      This endpoint is used for submitting word guesses during an active game.
      When a user makes a guess in the game (e.g., entering a 5-letter word), the frontend sends a request to this endpoint with the guessed word.
      The backend then processes the guess, checks if it's valid, compares it to the target word, calculates the result (e.g., how many letters are correct and in the right position), and updates the game state.
      The response typically includes information about the result of the guess, such as the number of correct letters and their positions.
    */
  }

  @Get('result')
  async getGameResult() {
    return 'getGameResult';
    /**
      This endpoint is used to retrieve the final result of a completed game.
      When the user has either successfully guessed the word or exhausted their allowed attempts, the game is considered over.
      The frontend can request the result of the game by sending a request to this endpoint.
      The backend responds with the final outcome of the game, which might include whether the user won, lost, or achieved a certain score, and possibly the correct word.
     */
  }
}
