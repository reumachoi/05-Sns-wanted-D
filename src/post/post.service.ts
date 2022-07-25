import {
  BadRequestException,
  ConsoleLogger,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'src/entities/Like';
import { Post } from 'src/entities/Post';
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

    console.log(user);
    const post = this.repository.create({
      title: title,
      content: content,
      tag: tag,
      user: user,
    });

    return await this.repository.save(post);
  }

  async getAllPost() {
    const results = await this.repository
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
      .getRawMany();

    return results;
  }

  async getOnePost(id: number) {
    await this.repository
      .createQueryBuilder()
      .update(Post)
      .set({ views: () => 'views + 1' })
      .where('id = :id', { id: id })
      .andWhere('deleted_at IS NULL')
      .execute();

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

    const result = await this.repository
      .createQueryBuilder()
      .update(Post)
      .set({ title: title, content: content, tag: tag })
      .where('post.id = :id', { id: id })
      .execute();

    return result.affected === 1 ? '글 수정 성공!' : '글 수정 실패!';
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

    const result = await this.repository
      .createQueryBuilder()
      .update(Post)
      .set({ deletedAt: null })
      .where('post.id = :id', { id: id })
      .execute();
    return result.affected === 1 ? '글 복구 성공!' : '글 복구 실패!';
  }

  async likePost(id: number, user: User) {
    // 해당 게시물 조회
    const post = await this.repository
      .createQueryBuilder('post')
      .select()
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

    // 이미 해당 게시물에 좋아요를 누른경우 -> 좋아요 카운트 다운!
    if (likeData) {
      // 게시물 좋아요수 감소
      await this.repository
        .createQueryBuilder('post')
        .update(Post)
        .set({ likes: () => 'likes - 1' })
        .where('post.id = :id', { id: id })
        .execute();

      // 좋아요 테이블에서 해당글 좋아요 정보 삭제
      await this.likeRepository.delete(likeData.id);
      return '글 좋아요 취소!';
    }

    // 테이블에 새로 정보 저장좋아요 -> 카운트 업!
    const data = this.likeRepository.create({
      post: { id: post.id },
      user: { id: user.id },
    });
    await this.likeRepository.save(data);

    const result = await this.repository
      .createQueryBuilder('post')
      .update(Post)
      .set({ likes: () => 'likes + 1' })
      .where('post.id = :id', { id: id })
      .andWhere('post.deleted_at IS NULL')
      .execute();

    return result.affected === 1 ? '글 좋아요 성공!' : '글 좋아요 실패!';
  }
}
