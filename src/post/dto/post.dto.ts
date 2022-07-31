import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
  @ApiProperty({ example: '게시글 테스트 제목', description: '제목' })
  title: string;

  @ApiProperty({ example: '게시글 테스트 내용', description: '내용' })
  content: string;

  @ApiProperty({ example: '#게시글테스트태그', description: '태그' })
  tag: string;
}
