import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['user', 'name'])
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'accountId' })
  id: string;

  @Column({ length: 20, nullable: false })
  name: string;

  @Column({
    type: 'double',
    default: 0.0,
    nullable: false,
    precision: 10,
    scale: 2,
  })
  balance: number;

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @RelationId((account: Account) => account.user)
  userId: string;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
