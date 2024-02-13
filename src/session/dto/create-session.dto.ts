import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { STATUS } from '../types';

export class CreateSessionDto {
  // @IsString()
  // @IsNotEmpty()
  // userId: string;

  @IsString()
  @Length(5)
  @IsNotEmpty()
  wordToGuess: string;

  @IsNumber()
  attemptsRemaining: number;

  @IsArray()
  attempts: any[];

  @IsEnum(STATUS)
  status: STATUS;
}
