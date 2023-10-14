import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class WordGuessDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  guess: string;
}
