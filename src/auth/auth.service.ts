import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private repository: Repository<User>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    return await this.repository.save(signUpDto);
  }

  async signIn(signInDto: SignInDto) {
    const { email, pwd } = signInDto;

    const user = await this.repository.findOneBy({
      email: email,
      pwd: pwd,
    });

    if (user) {
      const accessToken = await this.makeAccessToken(user.id);
      const refreshToken = await this.makeRefreshToken(user.id);
      return { accessToken, refreshToken };
    } else {
      throw new UnauthorizedException('로그인을 실패했습니다.');
    }
  }

  async makeAccessToken(userId: number) {
    const payload = { userId };
    return await this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}h`,
    });
  }
}
