import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private readonly accountService: AccountService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new transaction and update the associated account's balance.
   * This method will create a transaction and adjust the account balance based on the transaction type.
   * @param createTransactionDto - The DTO containing transaction details
   * @returns The created transaction
   * @throws Error if the account does not exist or if the transaction cannot be created
   */
  async create(createTransactionDto: CreateTransactionDto) {
    const { accountId, ...rest } = createTransactionDto;
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // Validate account exists
      const account = await this.accountService.findOne(accountId, manager);
      if (!account) {
        throw new Error('Account not found');
      }

      // Update account balance
      const newBalance =
        account.balance +
        (rest.type === TransactionType.CREDIT ? rest.amount : -rest.amount);

      await this.accountService.update(
        accountId,
        { balance: newBalance },
        manager,
      );

      // Create and save transaction
      const transaction = manager.create(Transaction, {
        ...rest,
        account: { id: accountId },
      });
      return manager.save(transaction);
    });
  }

  findAll() {
    return this.transactionRepository.find();
  }

  findOne(id: string) {
    return this.transactionRepository.findOne({
      where: { id },
    });
  }

  /**
   * Update an existing transaction and adjust the account balance accordingly.
   * This method will reverse the effect of the old transaction and apply the new transaction details.
   * @param id - The ID of the transaction to update
   * @param updateTransactionDto - The DTO containing updated transaction details
   * @returns The updated transaction
   * @throws Error if the transaction or account is not found
   */
  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // Fetch the existing transaction
      const existingTransaction = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account'],
      });
      if (!existingTransaction) throw new Error('Transaction not found');

      // Fetch the old account
      const oldAccount = await this.accountService.findOne(
        existingTransaction.account.id,
        manager,
      );
      if (!oldAccount) throw new Error('Old account not found');

      // Reverse the old transaction's effect
      let oldAccountNewBalance = oldAccount.balance;
      if (existingTransaction.type === TransactionType.CREDIT) {
        oldAccountNewBalance -= existingTransaction.amount;
      } else {
        oldAccountNewBalance += existingTransaction.amount;
      }

      // Determine new account and new values
      const newType = updateTransactionDto.type ?? existingTransaction.type;
      const newAmount =
        updateTransactionDto.amount ?? existingTransaction.amount;

      const newAccountId =
        updateTransactionDto.accountId ?? existingTransaction.account.id;
      const newAccount =
        newAccountId === oldAccount.id
          ? oldAccount
          : await this.accountService.findOne(newAccountId, manager);
      if (!newAccount) throw new Error('New account not found');

      // Apply the new transaction's effect
      let newAccountNewBalance = newAccount.balance;
      if (newType === TransactionType.CREDIT) {
        newAccountNewBalance += newAmount;
      } else {
        newAccountNewBalance -= newAmount;
      }

      // update old account balance
      await this.accountService.update(
        oldAccount.id,
        { balance: oldAccountNewBalance },
        manager,
      );

      // update new account balance
      await this.accountService.update(
        newAccount.id,
        { balance: newAccountNewBalance },
        manager,
      );

      // Prepare update object without accountId
      const { accountId, ...restDto } = updateTransactionDto;
      await manager.update(Transaction, id, {
        ...restDto,
        account: { id: newAccountId },
      });

      // Return the updated transaction
      return manager.findOne(Transaction, { where: { id } });
    });
  }

  /**
   * Remove a transaction and update the account balance accordingly.
   * This method will reverse the transaction amount from the account's balance.
   * @param id - The ID of the transaction to remove
   * @returns DeleteResult - The result of the delete operation
   * @throws Error if the transaction or account is not found
   */
  remove(id: string) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // Validate transaction exists
      const transaction = await manager.findOne(Transaction, {
        where: { id },
        relations: ['account'],
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // fetch current account balance
      const account = await this.accountService.findOne(
        transaction.account.id,
        manager,
      );
      if (!account) {
        throw new Error('Account not found');
      }

      // calculate new account balance, reversing the transaction amount
      const newBalance =
        account.balance +
        (transaction.type === TransactionType.CREDIT
          ? -transaction.amount
          : transaction.amount);

      // update account balance
      await this.accountService.update(
        account.id,
        { balance: newBalance },
        manager,
      );

      // delete the transaction
      return manager.delete(Transaction, { id: id });
    });
  }
}
