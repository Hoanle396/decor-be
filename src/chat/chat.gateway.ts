import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  socket: Server;

  @SubscribeMessage('send')
  send(@MessageBody() data: any) {
    console.log(data);
    this.socket.emit('receive', data);
  }
}
