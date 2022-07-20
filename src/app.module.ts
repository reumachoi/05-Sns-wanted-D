import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import * as ormConfig from '../ormConfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), AuthModule, PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
