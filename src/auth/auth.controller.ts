import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('/sns/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/sign-up')
  signUp(@Body() authDto: AuthDto) {
    return this.service.signUp(authDto);
  }

  @Post('/sign-in')
  signIn(@Body() authDto: AuthDto) {
    return this.service.signIn(authDto);
  }
}
