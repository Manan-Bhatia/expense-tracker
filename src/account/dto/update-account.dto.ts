import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsNumber()
  balance?: number | undefined;

  @IsString()
  name?: string | undefined;
}
