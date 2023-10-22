import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { Users } from './entities/users.entity';
import { UsersModule } from './users/users.module';
import { Message } from './entities/message.entity';
import { Post } from './entities/post.entity';
import { Category } from './entities/category.entity';
import { Comments } from './entities/comments.entity';
import { Images } from './entities/images.entity';
import { PostModule } from './post/post.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DBNAME,
      entities: [Users, Message, Post, Category, Comments, Images],
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    // RedisModule.forRoot({
    //   readyLog: true,
    //   config: {
    //     host: process.env.REDIS_HOST || '127.0.0.1',
    //     port: Number(process.env.REDIS_PORT) || 6379,
    //     // username: process.env.REDIS_USER || 'default',
    //     // password: process.env.REDIS_PASSWORD || 'redis',
    //   },
    // }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/public'),
    }),
    AuthModule,
    UsersModule,
    ChatModule,
    PostModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
