import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class JoinFamilyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  username: string;
}