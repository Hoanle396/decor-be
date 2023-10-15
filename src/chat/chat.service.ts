import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Message } from 'src/entities/message.entity';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDTO } from './dto/Create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @Inject(CACHE_MANAGER) private cacheManager,
    private gateway: ChatGateway
  ) {}
  private async checkIfUsersExist(from: string, to: string): Promise<void> {
    if (!(await this.userRepository.findOne({ where: { email: to } }))) {
      throw new HttpException(
        "Receiver of the message doesn't exist in the system",
        HttpStatus.BAD_REQUEST
      );
    }
    if (!(await this.userRepository.findOne({ where: { email: from } }))) {
      throw new HttpException(
        "Sender of the message doesn't exist in the system",
        HttpStatus.BAD_REQUEST
      );
    }
  }
  private async getRecipientToken(email: string): Promise<boolean> {
    return this.cacheManager.get(email);
  }
  async createMessage(data: CreateMessageDTO) {
    const { to, from } = data;
    await this.checkIfUsersExist(from, to);
    const message = this.messageRepository.create(data);
    // const token = await this.getRecipientToken(to);
    // if (token) {
    this.gateway.send(message);

    // }
    message.delivered = true;
    message.seen = false;
    await this.messageRepository.save(message);
    return message;
  }
  async getConversation(to: string, from, options: IPaginationOptions) {
    try {
      const queryBuilder = this.messageRepository.createQueryBuilder('message');
      if (to !== from) {
        queryBuilder
          .where(
            'message.from = :from and message.to = :to or message.from = :to and message.to = :from',
            { from, to }
          )
          .orderBy('message.createAt', 'DESC');
      } else {
        queryBuilder
          .where('message.from = :from and message.to = :to', {
            from,
            to,
          })
          .orderBy('message.createAt', 'DESC');
      }
      const messages = await paginate<Message>(queryBuilder, options);
      const unseenCount = await this.messageRepository.count({
        where: {
          from: to,
          to: from,
          seen: false,
        },
      });
      let seenCount = 0;
      if (messages.items) {
        for (const message of messages.items) {
          if (!message.seen) {
            ++seenCount;
            message.seen = true;
            this.messageRepository.save(message);
          }
        }
      }
      const { items, meta, links } = messages;
      return {
        items,
        meta,
        links,
        unseenItems: unseenCount - seenCount,
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
