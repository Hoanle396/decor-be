import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
// import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Post } from 'src/entities/post.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Images } from 'src/entities/images.entity';
import { Category } from 'src/entities/category.entity';
import { Users } from 'src/entities/users.entity';
import { Pagination, ResponsePaginate } from 'src/utils/paginate';

@Injectable()
export class PostService {
  constructor(
    private dataSource: DataSource,
    private cloudService: CloudinaryService,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
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

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
