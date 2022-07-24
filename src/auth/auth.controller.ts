import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('/sns/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() authDto: AuthDto) {
    return await this.service.signUp(authDto);
  }

  @Post('/sign-in')
  async signIn(@Body() authDto: AuthDto) {
    return await this.service.signIn(authDto);
  }
}
