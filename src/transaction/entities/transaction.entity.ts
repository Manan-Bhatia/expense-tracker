import { Account } from 'src/account/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.DEBIT,
    nullable: false,
  })
  type: TransactionType;

  @Column({ type: 'double', precision: 10, scale: 2, nullable: false })
  amount: number;

  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  account: Account;

  @RelationId((transaction: Transaction) => transaction.account)
  accountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
