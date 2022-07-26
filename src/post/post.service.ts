import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '../entities/Like';
import { Post } from '../entities/Post';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private repository: Repository<Post>,
    @InjectRepository(Like) private likeRepository: Repository<Like>,
  ) {}

  async createPost(postDto: PostDto, user: User) {
    const { title, content, tag } = postDto;

    const post = this.repository.create({
      title: title,
      content: content,
      tag: tag,
      user: user,
    });

    return await this.repository.save(post);
  }

  async getAllPost(order: string, search: string, tag: string) {
    const query = this.repository
      .createQueryBuilder()
      .select([
        'title',
        'content',
        'tag',
        'created_at',
        'likes',
        'views',
        'userId',
      ])
      .where('deleted_at IS NULL');

    if (order && search && tag) {
      // 정렬, 제목 검색, 해쉬태그 검색 일괄조건 전체조회
      return query
        .andWhere('title like :search', {
          search: `%${search}%`,
        })
        .orderBy(`${order}`, 'DESC')
        .getRawMany();
    } else if (order && !search && !tag) {
      // 정렬 기준만 설정해서 목록조회 경우
      return query.orderBy(`${order}`, 'DESC').getRawMany();
    } else if (!order && search && !tag) {
      // 제목 키워드만 설정해서 목록조회 경우
      return query
        .andWhere('title like :search', {
          search: `%${search}%`,
        })
        .getRawMany();
    } else if (!order && !search && tag) {
      // 태그 키워드만 설정해서 목록조회 경우
      return query.andWhere('tag like :tag', { tag: `%#${tag}%` }).getRawMany();
    } else {
      // 추가 설정없이 목록 조회
      return query.getRawMany();
    }
  }

  async getPage(idx: number, size: number) {
    size = size == null ? 10 : size; // 한페이지에 나타낼 게시글 수를 정하지 않은 경우 기본 10개 표시

    return this.repository
      .createQueryBuilder()
      .select([
        'title',
        'content',
        'tag',
        'created_at',
        'likes',
        'views',
        'userId',
      ])
      .where('deleted_at IS NULL')
      .skip(idx)
      .take(size)
      .getRawMany();
  }

  async getOnePost(id: number) {
    // 조회수 증가
    this.viewCountUp(id);

    const result = await this.repository
      .createQueryBuilder()
      .select(['title', 'tag', 'created_at', 'likes', 'views', 'userId'])
      .where('id = :id', { id: id })
      .andWhere('deleted_at IS NULL')
      .getRawOne();

    if (!result) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }
    return result;
  }

  async viewCountUp(id: number) {
    return await this.repository
      .createQueryBuilder()
      .update(Post)
      .set({ views: () => 'views + 1' })
      .where('id = :id', { id: id })
      .andWhere('deleted_at IS NULL')
      .execute();
  }

  async updatePost(id: number, postDto: PostDto, user: User) {
    const post = await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id: id })
      .andWhere('post.deleted_at IS NULL')
      .getOne();

    if (!post) {
      throw new BadRequestException(
        '해당 게시물을 찾을 수 없어 수정을 실패했습니다.',
      );
    }

    if (post.user.id !== user.id) {
      throw new ForbiddenException(
        '게시글 작성자가 아니므로 수정을 실패했습니다.',
      );
    }

    const { title, content, tag } = postDto;

    await this.repository
      .createQueryBuilder()
      .update(Post)
      .set({ title: title, content: content, tag: tag })
      .where('post.id = :id', { id: id })
      .execute();

    return '글 수정 성공!';
  }

  async deletePost(id: number, user: User) {
    const data = await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id: id })
      .getOne();

    if (data.user.id !== user.id) {
      throw new ForbiddenException(
        '게시글 작성자가 아니므로 삭제를 실패했습니다.',
      );
    }

    // 이미 삭제된 글을 삭제하려는 경우
    if (data.deletedAt != null) {
      throw new ForbiddenException('해당 게시글을 삭제할 수 없습니다.');
    }

    const result = await this.repository
      .createQueryBuilder()
      .update(Post)
      .set({ deletedAt: new Date() })
      .where('post.id = :id', { id: id })
      .execute();
    return result.affected === 1 ? '글 삭제 성공!' : '글 삭제 실패!';
  }

  async restorePost(id: number, user: User) {
    const data = await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id: id })
      .getOne();

    if (data.user.id !== user.id) {
      throw new ForbiddenException(
        '게시글 작성자가 아니므로 복구를 실패했습니다.',
      );
    }

    // 삭제된 글이 아닌 경우
    if (data.deletedAt == null) {
      throw new ForbiddenException('해당 게시글을 복구할 수 없습니다.');
    }

    await this.repository
      .createQueryBuilder()
      .update(Post)
      .set({ deletedAt: null })
      .where('post.id = :id', { id: id })
      .execute();
    return '글 복구 성공!';
  }

  async likePost(id: number, user: User) {
    // 해당 게시물 조회
    const post = await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :id', { id: id })
      .andWhere('post.deleted_at IS NULL')
      .getOne();

    if (!post) {
      throw new BadRequestException(
        '해당 게시물을 찾을 수 없어 좋아요를 실패했습니다.',
      );
    }

    const likeData = await this.likeRepository
      .createQueryBuilder('like')
      .leftJoinAndSelect('like.user', 'user')
      .where('like.postId = :pid', { pid: id })
      .andWhere('like.userId = :uid', { uid: user.id })
      .getOne();

    // 이미 해당 게시물에 좋아요를 누른경우 -> 좋아요 수 감소
    if (likeData) {
      // 좋아요 테이블에서 해당글 좋아요 정보 삭제
      await this.likeRepository.delete(likeData.id);
      await this.updateLikeInPostTable('down', id);

      return '글 좋아요 취소!';
    }

    await this.likeRepository.save({
      post: { id: post.id },
      user: { id: user.id },
    });

    await this.updateLikeInPostTable('up', id);
    return '글 좋아요 성공!';
  }

  // 좋아요 관련 Post 테이블 업데이트
  async updateLikeInPostTable(upDown: string, id: number) {
    const query = this.repository.createQueryBuilder('post').update(Post);

    if (upDown === 'up') {
      return query
        .set({ likes: () => 'likes + 1' })
        .where('post.id = :id', { id: id })
        .andWhere('post.deleted_at IS NULL')
        .execute();
    } else {
      return query
        .set({ likes: () => 'likes - 1' })
        .where('post.id = :id', { id: id })
        .execute();
    }
  }
}
