import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  signUp(signUpDto: SignUpDto) {
    return this.repository.save(signUpDto);
  }
}
