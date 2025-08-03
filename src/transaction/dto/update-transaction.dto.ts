import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @IsEnum(TransactionType)
  type?: TransactionType | undefined;

  @IsNumber()
  amount?: number | undefined;

  @IsString()
  accountId?: string | undefined;
}
