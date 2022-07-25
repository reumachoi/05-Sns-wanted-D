import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('/sns/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.service.signUp(signUpDto);
  }

  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.service.signIn(signInDto);
  }
}
