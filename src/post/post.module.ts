import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Images } from '../entities/images.entity';
import { Post } from '../entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Comments } from '../entities/comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Images, Comments])],
  controllers: [PostController],
  providers: [PostService, CloudinaryService],
})
export class PostModule {}
