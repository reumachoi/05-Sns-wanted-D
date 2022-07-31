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

  describe('게시글 작성, 수정, 삭제, 복구', () => {
    it('성공 - 게시글 작성', async () => {
      // Given
      const post = {
        title: postDto.title,
        content: postDto.content,
        tag: postDto.tag,
        user: user,
      };

      // When
      postRepository.save.mockResolvedValue(post);

      // Then
      const result = await service.createPost(postDto, user);
      expect(result).toEqual(post);
    });

    it('실패 - 없거나 삭제된 게시글 수정', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .andWhere()
        .getOne.mockResolvedValue(null);

      // Then
      try {
        await service.updatePost(1, postDto, user);
      } catch (error) {
        expect(error).toEqual(
          new BadRequestException(
            '해당 게시물을 찾을 수 없어 수정을 실패했습니다.',
          ),
        );
      }
    });

    it('실패 -작성자가 아닌 게시글 수정', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .andWhere()
        .getOne.mockResolvedValue(postDetail);

      // Then
      try {
        await service.updatePost(1, postDto, user);
      } catch (error) {
        expect(error).toEqual(
          new ForbiddenException(
            '게시글 작성자가 아니므로 수정을 실패했습니다.',
          ),
        );
      }
    });

    it('실패 - 작성자가 아닌 게시글 삭제', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .getOne.mockResolvedValue(postDetail);

      // Then
      try {
        await service.deletePost(1, user);
      } catch (error) {
        expect(error).toEqual(
          new ForbiddenException(
            '게시글 작성자가 아니므로 삭제를 실패했습니다.',
          ),
        );
      }
    });

    it('실패 - 삭제된 게시글 삭제', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .getOne.mockResolvedValue(deletedPostDetail);

      // Then
      try {
        // 게시글 작성자가 동일하지만 삭제된 게시글을 삭제하는 경우
        await service.deletePost(1, user2);
      } catch (error) {
        expect(error).toEqual(
          new ForbiddenException('해당 게시글을 삭제할 수 없습니다.'),
        );
      }
    });

    it('실패 - 작성자가 아닌 게시글 복구', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .getOne.mockResolvedValue(postDetail);

      // Then
      try {
        await service.restorePost(1, user);
      } catch (error) {
        expect(error).toEqual(
          new ForbiddenException(
            '게시글 작성자가 아니므로 복구를 실패했습니다.',
          ),
        );
      }
    });

    it('실패 - 없는 게시글 또는 삭제되지 않은 게시글 복구', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .getOne.mockResolvedValue(postDetail);

      // Then
      try {
        await service.restorePost(1, user2);
      } catch (error) {
        expect(error).toEqual(
          new ForbiddenException('해당 게시글을 복구할 수 없습니다.'),
        );
      }
    });
  });

  describe('게시글 조회', () => {
    it('성공 - 게시글 상세조회시 조회수 증가', async () => {
      // Given
      postDetail.views += 1;

      // When
      postRepository
        .createQueryBuilder()
        .update()
        .set()
        .where()
        .andWhere()
        .execute.mockResolvedValue(postDetail);

      // Then
      const result = await service.viewCountUp(1);
      expect(result).toEqual(postDetail);
    });

    it('성공 - 게시글 상세조회 글 확인', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .select()
        .where()
        .andWhere()
        .getRawOne.mockResolvedValue(postDetail);

      // Then
      const result = await service.getOnePost(1);
      expect(result).toEqual(postDetail);
    });

    it('실패 - 게시글 상세조회 글 확인', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .select()
        .where()
        .andWhere()
        .getRawOne.mockResolvedValue(undefined);

      // Then
      try {
        await service.getOnePost(1);
      } catch (error) {
        expect(error).toEqual(
          new NotFoundException('해당 게시글을 찾을 수 없습니다.'),
        );
      }
    });

    it('성공 - 게시글 목록조회', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .select()
        .where()
        .andWhere()
        .orderBy()
        .getRawMany.mockResolvedValue(posts);

      // Then
      const result = await service.getAllPost('views', 'title', 'tag');
      expect(result).toEqual(posts);
    });

    it('성공 - 게시글 페이지조회', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .select()
        .where()
        .skip()
        .take()
        .getRawMany.mockResolvedValue(posts);

      // Then
      const result = await service.getPage(0, 2);
      expect(result).toEqual(posts);
    });
  });

  describe('게시글 좋아요', () => {
    it('실패 - 게시글을 찾을 수 없는 경우', async () => {
      // When
      postRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .andWhere()
        .getOne.mockResolvedValue(null);

      // Then
      try {
        await service.likePost(1, user);
      } catch (error) {
        expect(error).toEqual(
          new BadRequestException(
            '해당 게시물을 찾을 수 없어 좋아요를 실패했습니다.',
          ),
        );
      }
    });

    it('성공 - 좋아요 성공시 Post, Like 테이블 업데이트', async () => {
      // Given
      postDetail.likes++;
      const updateResult = { generatedMaps: [], raw: [], affected: 1 };
      const data = {
        post: post,
        user: user,
      };

      // When
      likeRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .andWhere()
        .getOne.mockResolvedValue(null);

      likeRepository
        .createQueryBuilder()
        .update()
        .set()
        .where()
        .andWhere()
        .execute.mockResolvedValue(updateResult);

      likeRepository.save.mockResolvedValue(data);

      // Then
      await service.updateLikeInPostTable('up', 1);
      const result = await service.likePost(1, user);
      expect(result).toEqual('글 좋아요 성공!');
    });

    it('성공 - 좋아요 취소시 Post, Like 테이블 업데이트', async () => {
      // Given
      postDetail.likes--;
      const deleteResult = { raw: [], affected: 1 };
      const likeData = {
        id: 1,
        post: post,
        user: user,
      };

      // When
      likeRepository
        .createQueryBuilder()
        .leftJoinAndSelect()
        .where()
        .andWhere()
        .getOne.mockResolvedValue(likeData);

      likeRepository.delete.mockResolvedValue(deleteResult);

      // Then
      await service.updateLikeInPostTable('down', 1);
      const result = await service.likePost(1, user);
      expect(result).toEqual('글 좋아요 취소!');
    });
  });
});
