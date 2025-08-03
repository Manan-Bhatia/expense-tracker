import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { EntityManager, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  create(createAccountDto: CreateAccountDto) {
    const { userId, ...rest } = createAccountDto;
    const account = this.accountRepository.create({
      ...rest,
      user: { id: userId },
    });
    return this.accountRepository.save(account);
  }

  findAll() {
    return this.accountRepository.find({ relations: ['transactions'] });
  }

  async findOne(id: string, manager?: EntityManager) {
    if (manager) {
      return manager.findOne(Account, { where: { id } });
    }
    return await this.accountRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
    manager?: EntityManager,
  ) {
    if (manager) {
      await manager.update(Account, id, updateAccountDto);
      return manager.findOne(Account, { where: { id } });
    }
    await this.accountRepository.update(id, updateAccountDto);
    return this.accountRepository.findOne({ where: { id } });
  }

  remove(id: string) {
    return this.accountRepository.delete(id);
  }
}
