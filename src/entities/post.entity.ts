import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Images } from './images.entity';
import { Category } from './category.entity';
import { Comments } from './comments.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (user) => user.posts)
  createdBy: Users;

  @OneToMany(() => Images, (img) => img.post)
  images: Images[];

  @ManyToOne(() => Category, (category) => category.posts)
  category: Category;

  @OneToMany(() => Comments, (cmt) => cmt.post)
  comments: Comments[];
}
