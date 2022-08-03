import { IsEmail, IsNotEmpty, Matches, Min } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[a-zA-Z])((?=.*\d)(?=.*\W)).{8,16}$/, {
    message:
      '비밀번호는 최소 하나의 문자, 숫자, 특수문자로 최소8자리에서 최대 16자리 입니다.',
  })
  pwd: string;

  @IsNotEmpty()
  nickname: string;
}
