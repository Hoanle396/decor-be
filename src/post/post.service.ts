import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Category } from '../entities/category.entity';
import { Comments } from '../entities/comments.entity';
import { Images } from '../entities/images.entity';
import { Post } from '../entities/post.entity';
import { Users } from '../entities/users.entity';
import { Pagination, ResponsePaginate } from '../utils/paginate';
import { DataSource, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comments.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    private dataSource: DataSource,
    private cloudService: CloudinaryService,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comments)
    private readonly commentsRepository: Repository<Comments>
  ) {}

  async create(
    createPostDto: CreatePostDto,
    files: Express.Multer.File[],
    users: Users
  ) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const post = new Post();
        post.category = await manager.findOne(Category, {
          where: { id: createPostDto.category },
        });
        post.description = createPostDto.description;
        post.name = createPostDto.name;
        post.createdBy = users;
        const result = await manager.save(post);
        const filesUploaded = await this.cloudService.uploadFiles(files);
        await Promise.all(
          filesUploaded.map(async ({ url }) => {
            const image = new Images();
            image.post = post;
            image.url = url;
            return await manager.save(image);
          })
        );
        return result;
      });
      return this.postRepository.findOne({
        where: { id: result.id },
        relations: {
          images: true,
          category: true,
        },
      });
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async findAll(paginate: Pagination): Promise<ResponsePaginate<Post>> {
    try {
      const [data, count] = await this.postRepository.findAndCount({
        skip: paginate.skip,
        take: paginate.limit,
        relations: {
          images: true,
          createdBy: true,
          category: true,
        },
      });
      return {
        meta: {
          page: paginate.skip / paginate.limit + 1,
          totalItems: count,
          totalPage: Math.ceil(count / paginate.limit),
          message: 'Get data successfully',
          status: 200,
        },
        data: data,
      };
    } catch {
      return {
        meta: {
          page: paginate.skip / paginate.limit + 1,
          totalItems: 0,
          totalPage: Math.ceil(0 / paginate.limit),
          message: 'Get data successfully',
          status: 200,
        },
        data: [],
      };
    }
  }

  async findOne(id: string) {
    return await this.postRepository.findOne({
      where: { id },
      relations: {
        images: true,
        createdBy: true,
        category: true,
      },
    });
  }

  async comments(id: string, { text }: CreateCommentDto, user: Users) {
    const blog = await this.postRepository.findOneBy({ id });
    if (blog) {
      const comments = new Comments();
      comments.post = blog;
      comments.createdBy = user;
      comments.text = text;
      return await this.commentsRepository.save(comments);
    }
    throw new NotFoundException();
  }

  async findComment(id: string, take, skip) {
    const blog = await this.postRepository.findOneBy({ id });
    if (blog) {
      const [rows, count] = await this.commentsRepository.findAndCount({
        where: { post: { id: blog.id } },
        relations: { createdBy: true },
        take,
        skip,
      });
      return {
        meta: {
          page: skip / take + 1,
          totalItems: count,
          totalPage: Math.ceil(count / take),
          message: 'Get data successfully',
          status: 200,
        },
        data: rows,
      };
    }
    throw new NotFoundException();
  }
}
