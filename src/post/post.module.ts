import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Images } from 'src/entities/images.entity';
import { Post } from 'src/entities/post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Images])],
  controllers: [PostController],
  providers: [PostService, CloudinaryService],
})
export class PostModule {}
