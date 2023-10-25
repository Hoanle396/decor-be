import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Images } from '../entities/images.entity';
import { Post } from '../entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Comments } from '../entities/comments.entity';
import { Category } from '../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Images, Comments, Category])],
  controllers: [PostController],
  providers: [PostService, CloudinaryService],
})
export class PostModule {}
