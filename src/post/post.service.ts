import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/entities/Post';
import { Repository } from 'typeorm';
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
      .createQueryBuilder('post')
      .select(['title', 'tag', 'created_at', 'likes', 'views', 'userId'])
      .orderBy('updated_at', 'DESC')
      .getRawMany();

    return results;
  }

  async getOnePost(id: number) {
    const result = await this.repository.findOneBy({ id: id });
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

    return result;
  }

  async deletePost(id: number) {
    await this.repository.softDelete({ id: id });
  }

  async restorePost(id: number) {
    await this.repository.restore({ id: id });
  }
}
