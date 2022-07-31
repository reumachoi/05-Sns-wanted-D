import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/sns/posts')
@ApiTags('게시글 API')
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '게시글 작성' })
  async createPost(@Body() postDto: PostDto, @GetUser() user: User) {
    return await this.service.createPost(postDto, user);
  }

  @Get()
  @ApiOperation({ summary: '게시글 전체조회' })
  async getAllPost(
    @Query('order') order: string,
    @Query('search') search: string,
    @Query('tag') tag: string,
  ) {
    return await this.service.getAllPost(order, search, tag);
  }

  @Get('/page')
  @ApiOperation({ summary: '게시글 전체조회 페이징' })
  @UseGuards(AuthGuard('jwt'))
  async getPage(@Query('idx') idx: number, @Query('size') size: number) {
    return await this.service.getPage(idx, size);
  }

  @Get('/:id')
  @ApiOperation({ summary: '게시글 전체조회 페이징' })
  async getOnePost(@Param('id') id: number) {
    return await this.service.getOnePost(id);
  }

  @Patch('/:id')
  @ApiOperation({ summary: '게시글 수정' })
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('id') id: number,
    @Body() postDto: PostDto,
    @GetUser() user: User,
  ) {
    const status = await this.service.updatePost(id, postDto, user);
    return { status: status };
  }

  @Delete('/:id')
  @ApiOperation({ summary: '게시글 삭제' })
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Param('id') id: number, @GetUser() user: User) {
    const status = await this.service.deletePost(id, user);
    return { status: status };
  }

  @Patch('/:id/restore')
  @ApiOperation({ summary: '게시글 복구' })
  @UseGuards(AuthGuard('jwt'))
  async restorePost(@Param('id') id: number, @GetUser() user: User) {
    const status = await this.service.restorePost(id, user);
    return { status: status };
  }

  @Get('/:id/like')
  @ApiOperation({ summary: '게시글 좋아요' })
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Param('id') id: number, @GetUser() user: User) {
    const status = await this.service.likePost(id, user);
    return { status: status };
  }
}
