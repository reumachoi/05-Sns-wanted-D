import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Like } from '../entities/Like';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostDto } from './dto/post.dto';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockRepository = () => ({
  save: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  delete: jest.fn().mockReturnThis(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PostService', () => {
  let service: PostService;
  let postRepository: MockRepository<Post>;
  let likeRepository: MockRepository<Like>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(Post), useValue: mockRepository() },
        { provide: getRepositoryToken(Like), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get<MockRepository<Post>>(getRepositoryToken(Post));
    likeRepository = module.get<MockRepository<Like>>(getRepositoryToken(Like));
  });

  const user: User = {
    email: 'email',
    pwd: 'pwd',
    nickname: 'nickname',
    id: 1,
    createdAt: undefined,
    deletedAt: undefined,
    post: [],
    token: [],
    like: [],
  };

  const user2: User = {
    email: 'email',
    pwd: 'pwd',
    nickname: 'nickname',
    id: 2,
    createdAt: undefined,
    deletedAt: undefined,
    post: [],
    token: [],
    like: [],
  };

  const post: Post = {
    title: 'title',
    content: 'content',
    tag: 'tag',
    id: 0,
    user: user,
    views: 0,
    likes: 0,
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    like: [],
  };

  const postDto: PostDto = {
    title: 'title',
    content: 'content',
    tag: 'tag',
  };

  const postDetail = {
    title: 'title',
    tag: 'tag',
    created_at: '2022-07-30T15:23:48.115Z',
    deleted_at: null,
    likes: 0,
    views: 0,
    user: { id: 2 },
    id: 1,
  };

  const deletedPostDetail = {
    title: 'title',
    tag: 'tag',
    created_at: '2022-07-30T15:23:48.115Z',
    deleted_at: '2022-07-31T15:23:48.115Z',
    likes: 0,
    views: 0,
    user: { id: 2 },
  };

  const posts = [
    {
      title: 'title',
      content: 'content',
      tag: 'tag',
      created_at: '2022-07-30T15:23:48.115Z',
      likes: 0,
      views: 1,
      userId: 16,
    },
    {
      title: 'title',
      content: 'content',
      tag: 'tag',
      created_at: '2022-07-31T02:38:58.193Z',
      likes: 0,
      views: 1,
      userId: 16,
    },
  ];

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
