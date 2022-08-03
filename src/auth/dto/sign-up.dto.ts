import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, Min } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'test@gmail.com', description: '이메일' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'pwd1234!', description: '비밀번호' })
  @IsNotEmpty()
  @Matches(/^(?=.*[a-zA-Z])((?=.*\d)(?=.*\W)).{8,16}$/, {
    message:
      '비밀번호는 최소 하나의 문자, 숫자, 특수문자로 최소8자리에서 최대 16자리 입니다.',
  })
  pwd: string;

  @ApiProperty({ example: 'nickname', description: '닉네임' })
  @IsNotEmpty()
  nickname: string;
}
