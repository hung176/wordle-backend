
## Description

This repository is the backend of wordle game. The front end is from `https://github.com/hung176/wordle-frontend`

## Endpoint

### POST /start
When a user wants to begin a new game, they make a request to this endpoint.
The backend generates a new game session, selects a random word, initializes game-related data (e.g., number of attempts), and returns an initial response to the user.

### POST /guess
When a user makes a guess in the game (e.g., entering a 5-letter word), the frontend sends a request to this endpoint with the guessed word.
The backend then processes the guess, checks if it's valid, compares it to the target word, calculates the result (e.g., how many letters are correct and in the right position), and updates the game state.

### GET /challenge/:challenged
When a user wants to begin a challenge game, they make a request to this endpoint with the challenge ID.
The backend generates a new game session for the challenge, selects a random word, initializes game-related data (e.g., number of attempts), and returns an initial response to the user.

### POST /challenge
This endpoint is used to submit a challenge game session.
When a user wants to submit a challenge game, they make a request to this endpoint with a word.
