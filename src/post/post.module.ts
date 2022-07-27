import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from '../entities/Post';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from '../entities/Like';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Like])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
