import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Repository } from 'typeorm';
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
    return this.accountRepository.find({
      relations: ['user'],
    });
  }

  findOne(id: string) {
    return this.accountRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  update(id: string, updateAccountDto: UpdateAccountDto) {
    return this.accountRepository.update(id, updateAccountDto);
  }

  remove(id: string) {
    return this.accountRepository.delete(id);
  }
}
