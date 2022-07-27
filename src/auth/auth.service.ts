import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Token } from '../entities/Token';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private repository: Repository<User>,
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
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
      const accessToken = await this.setAccessToken(user.id);
      const refreshToken = await this.setRefreshToken(user);
      return { accessToken, refreshToken };
    } else {
      throw new UnauthorizedException('로그인을 실패했습니다.');
    }
  }

  /**
   * 로그인시 새로운 액세스 토큰 생성 함수
   */
  async setAccessToken(userId: number) {
    const payload = { userId };
    return await this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}h`,
    });
  }

  /**
   * 리프레쉬 토큰 새로 생성 또는 유효기간 연장 처리 함수
   */
  async setRefreshToken(user: User) {
    const userId = user.id;
    const payload = { userId };
    const refreshToken = await this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}d`,
    });

    const data = await this.tokenRepository
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.user = :uid', { uid: userId })
      .getOne();

    if (!data) {
      // 리프레쉬 토큰이 없는 경우 새로 발급
      const newToken = this.tokenRepository.create({
        user: user,
        token: refreshToken,
        expiredAt: this.addExpireDays(
          new Date(),
          parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
        ),
      });

      await this.tokenRepository.save(newToken);
    } else {
      // 리프레쉬 토큰이 있는 경우 유효기간 연장
      await this.tokenRepository
        .createQueryBuilder()
        .update(Token)
        .set({
          expiredAt: this.addExpireDays(
            data.expiredAt,
            parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
          ),
        })
        .where('token.id = :id', { id: data.id })
        .execute();
    }

    return refreshToken;
  }

  /**
   * 리프레쉬 토큰 유효기간 처리 함수
   */
  addExpireDays(date: Date, plusDays: number) {
    date.setDate(date.getDate() + plusDays);
    return date;
  }
}
