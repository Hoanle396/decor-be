import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

import { CreateMessageDTO } from './dto/Create-message.dto';

@ApiTags('chat')
@Controller('chat')
@ApiBearerAuth()
export class ChatController {
  constructor(private messageService: ChatService) {}

  @Post('message')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createMessage(@Body() data: CreateMessageDTO, @Request() req) {
    data.from = req.user.email;
    return await this.messageService.createMessage(data);
  }

  @Get('conversation')
  @UseGuards(JwtAuthGuard)
  async index(
    @Query('with') convoWith: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req
  ) {
    limit = limit > 100 ? 100 : limit;
    return await this.messageService.getConversation(
      convoWith,
      req.user.email,
      { page, limit }
    );
  }
}
