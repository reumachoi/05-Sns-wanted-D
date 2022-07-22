import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getOnePost(id: number) {
    const result = await this.repository.findOneBy({ id: id });
    if (!result) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }
    return result;
  }
}
