import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/sns/auth')
@ApiTags('유저 API')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/sign-up')
  @ApiOperation({ summary: '유저 회원가입' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: '회원가입 성공입니다!' })
  @ApiResponse({ status: 409, description: '회원가입 실패입니다!' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.service.signUp(signUpDto);
  }

  @Post('/sign-in')
  @ApiOperation({ summary: '유저 로그인' })
  @ApiResponse({ status: 201, description: '로그인 성공입니다!' })
  @ApiResponse({ status: 401, description: '로그인 실패입니다!' })
  @ApiBody({ type: SignInDto })
  async signIn(@Body() signInDto: SignInDto) {
    return await this.service.signIn(signInDto);
  }
}
