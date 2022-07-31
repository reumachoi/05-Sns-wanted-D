import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('/sns/posts')
@ApiTags('게시글 API')
@ApiBadRequestResponse({ description: '잘못된 요청입니다.' })
@ApiUnauthorizedResponse({ description: '유저 인증에 실패했습니다.' })
@ApiForbiddenResponse({ description: '해당 게시글에 권한이 없습니다.' })
@ApiNotFoundResponse({ description: '요청에 대한 응답을 찾을 수 없습니다.' })
export class PostController {
  constructor(private readonly service: PostService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '게시글 작성' })
  @ApiBody({ type: PostDto })
  async createPost(@Body() postDto: PostDto, @GetUser() user: User) {
    return await this.service.createPost(postDto, user);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 전체조회' })
  async getAllPost(
    @Query('order') order: string,
    @Query('search') search: string,
    @Query('tag') tag: string,
  ) {
    return await this.service.getAllPost(order, search, tag);
  }

  @Get('/page')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 전체조회 페이징' })
  async getPage(@Query('idx') idx: number, @Query('size') size: number) {
    return await this.service.getPage(idx, size);
  }

  @Get('/:id')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 상세조회' })
  async getOnePost(@Param('id') id: number) {
    return await this.service.getOnePost(id);
  }

  @Patch('/:id')
  @ApiOperation({ summary: '게시글 수정' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
  async deletePost(@Param('id') id: number, @GetUser() user: User) {
    const status = await this.service.deletePost(id, user);
    return { status: status };
  }

  @Patch('/:id/restore')
  @ApiOperation({ summary: '게시글 복구' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  async restorePost(@Param('id') id: number, @GetUser() user: User) {
    const status = await this.service.restorePost(id, user);
    return { status: status };
  }

  @Get('/:id/like')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 좋아요' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  async likePost(@Param('id') id: number, @GetUser() user: User) {
    const status = await this.service.likePost(id, user);
    return { status: status };
  }
}
