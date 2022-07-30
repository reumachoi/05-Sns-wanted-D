import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Token } from '../entities/Token';
import { User } from '../entities/User';
import { Repository } from 'typeorm';
import { SignInDto } from './dto/sign-in.dto';

const mockRepository = () => ({
  save: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

// keyof Repository<T> -> Repository의 모든 method key를 불러옴
// jest.Mock 모든 key들을 가짜로 만들어줌
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        { provide: getRepositoryToken(Token), useValue: mockRepository() },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('회원가입', () => {
    it('실패 - 이메일 또는 닉네임 중복, Conflict 예외', async () => {
      // Given
      const signUpDto: SignUpDto = {
        email: 't',
        pwd: 't',
        nickname: 't',
      };

      // When
      userRepository.save.mockRejectedValue(Error);

      // Then
      try {
        await service.signUp(signUpDto);
      } catch (error) {
        expect(error).toEqual(new ConflictException('회원가입 실패'));
      }
    });
  });

  describe('로그인', () => {
    it('실패 - 이메일&비밀번호 오류', async () => {
      // Given
      const signInDto: SignInDto = {
        email: 't',
        pwd: 't',
      };

      // When
      userRepository.findOneBy.mockRejectedValue(undefined);

      // Then
      try {
        await service.signIn(signInDto);
      } catch (error) {
        expect(error).toEqual(
          new UnauthorizedException('로그인을 실패했습니다.'),
        );
      }
    });
  });
});
