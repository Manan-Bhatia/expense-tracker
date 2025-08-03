import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  balance: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
