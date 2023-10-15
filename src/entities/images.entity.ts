import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
@Entity()
export class Images extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  url: string;

  @ManyToOne(() => Post, (post) => post.images)
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
