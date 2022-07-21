import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {
    super({
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, //토큰 만료시 바로 strategy에서 에러 리턴 처리 (ture:에러처리 안함)
    });
  }

  async validate(payload) {
    const { email } = payload;
    const user: User = await this.repository.findOneBy({
      email: email,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
