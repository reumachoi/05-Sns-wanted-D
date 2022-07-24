import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { PostService } from './post.service';
import { User } from '../entities/User';
import { PostDto } from './dto/post.dto';

@Controller('/sns/posts')
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createPost(@Body() postDto: PostDto, @GetUser() user: User) {
    return await this.service.createPost(postDto, user);
  }

  @Get()
  async getAllPost() {
    return await this.service.getAllPost();
  }

  @Get('/:id')
  async getOnePost(@Param('id') id: number) {
    return await this.service.getOnePost(id);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('id') id: number,
    @Body() postDto: PostDto,
    @GetUser() user: User,
  ) {
    return await this.service.updatePost(id, postDto, user);
  }

  @Delete('/:id')
  async deletePost(@Param('id') id: number) {
    return await this.service.deletePost(id);
  }

  @Patch('/:id/restore')
  async restorePost(@Param('id') id: number) {
    return await this.service.restorePost(id);
  }
}
