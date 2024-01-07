import { IsString, IsNotEmpty, Length } from 'class-validator';

export class WordGuessDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  @Length(5)
  guess: string;
}
