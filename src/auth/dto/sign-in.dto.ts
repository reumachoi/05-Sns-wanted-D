import { ApiProperty } from '@nestjs/swagger';
import { MinKey } from 'typeorm';

export class SignInDto {
  @ApiProperty({ example: 'test@gmail.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: 'pwd1234!', description: '비밀번호' })
  pwd: string;
}
