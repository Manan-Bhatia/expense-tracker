import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['accounts'] });
  }

  findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['accounts'],
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    // update a user by id
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
