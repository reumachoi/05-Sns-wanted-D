import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/entities/Post';
import { IsNull, Repository } from 'typeorm';
import { User } from '../entities/User';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(@InjectRepository(Post) private repository: Repository<Post>) {}

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
      .select(['title', 'tag', 'created_at', 'likes', 'views', 'userId'])
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
      .select()
      .where('id = :id', { id: id })
      .andWhere('deleted_at IS NULL')
      .getOne();

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
}
