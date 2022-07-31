import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'test@gmail.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: 'pwd1234!', description: '비밀번호' })
  pwd: string;

  @ApiProperty({ example: 'nickname', description: '닉네임' })
  nickname: string;
}
