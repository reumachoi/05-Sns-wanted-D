import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.like)
  post: Post;

  @ManyToOne(() => User, (user) => user.like)
  user: User;
}
