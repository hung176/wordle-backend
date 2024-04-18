import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { STATUS } from '../types';
import { ChallengeType } from 'src/challenge/schemas/challenge.schema';

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

  @IsString()
  challengeId?: string;

  @IsEnum(ChallengeType)
  challengeType?: ChallengeType;
}
