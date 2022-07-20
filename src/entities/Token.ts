import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' }) //유저 탈퇴시 토큰삭제
  user: User;

  @Column()
  token: string;

  @Column()
  expiredAt: Date;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
