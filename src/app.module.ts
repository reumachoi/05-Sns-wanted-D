import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as ormConfig from '../ormConfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
