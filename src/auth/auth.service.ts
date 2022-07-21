import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private repository: Repository<User>,
  ) {}

  async signUp(authDto: AuthDto) {
    return await this.repository.save(authDto);
  }

  async signIn(authDto: AuthDto) {
    const { email, pwd } = authDto;
    const user = await this.repository.findOneBy({
      email: email,
      pwd: pwd,
    });

    if (user) {
      const accessToken = await this.jwtService.sign({ data: email });

      return { accessToken };
    } else {
      throw new UnauthorizedException('로그인을 실패했습니다.');
    }
  }
}
