import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetPagination, Pagination } from '../utils/paginate';
import { CreateCommentDto } from './dto/create-comments.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@Controller('post')
@ApiTags('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createPostDto: CreatePostDto,
    @Req() req
  ) {
    return this.postService.create(createPostDto, files, req.user);
  }

  @Get()
  @ApiQuery({ name: 'skip', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async findAll(@GetPagination() pagination: Pagination) {
    return this.postService.findAll(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async comments(
    @Param('id') id: string,
    @Body() commentsDto: CreateCommentDto,
    @Req() req
  ) {
    return await this.postService.comments(id, commentsDto, req.user);
  }

  @Get('comments/:id')
  @ApiQuery({ name: 'skip', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async findComment(
    @Param('id') id: string,
    @GetPagination() pagination: Pagination
  ) {
    return await this.postService.findComment(
      id,
      pagination.limit,
      pagination.skip
    );
  }

  @Get('category')
  async findCategory() {
    return this.postService.findCategory();
  }

  @Get('category/:id')
  @ApiQuery({ name: 'skip', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async findByCategory(
    @GetPagination() pagination: Pagination,
    @Param('id') id: string
  ) {
    return this.postService.findByCategory(pagination, id);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }
}
