import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Like } from './Like';
import { Post } from './Post';
import { Token } from './Token';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  pwd: string;

  @Column({ unique: true })
  nickname: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Token, (token) => token.user)
  token: Token[];

  @OneToMany(() => Like, (like) => like.user)
  like: Like[];
}
