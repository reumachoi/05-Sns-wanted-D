import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
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
  async getAllPost(
    @Query('order') order: string,
    @Query('search') search: string,
    @Query('tag') tag: string,
  ) {
    return await this.service.getAllPost(order, search, tag);
  }

  @Get('/page')
  @UseGuards(AuthGuard('jwt'))
  async getPage(
    @Query('idx', ParseIntPipe) idx: number,
    @Query('size', ParseIntPipe) size: number,
  ) {
    return await this.service.getPage(idx, size);
  }

  @Get('/:id')
  async getOnePost(@Param('id', ParseIntPipe) id: number) {
    return await this.service.getOnePost(id);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() postDto: PostDto,
    @GetUser() user: User,
  ) {
    const status = await this.service.updatePost(id, postDto, user);
    return { status: status };
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    const status = await this.service.deletePost(id, user);
    return { status: status };
  }

  @Patch('/:id/restore')
  @UseGuards(AuthGuard('jwt'))
  async restorePost(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    const status = await this.service.restorePost(id, user);
    return { status: status };
  }

  @Get('/:id/like')
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    const status = await this.service.likePost(id, user);
    return { status: status };
  }
}
