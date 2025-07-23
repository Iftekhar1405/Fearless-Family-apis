import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsNotEmpty()
  familyCode: string;

  @IsString()
  @IsNotEmpty()
  memberId: string;
}