import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}

  // client connect
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  // message event
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: number; receiverId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messageService.sendMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );

    // 2 user message send
    this.server.to(`user_${data.senderId}`).emit('newMessage', message);
    this.server.to(`user_${data.receiverId}`).emit('newMessage', message);

    return message;
  }

  // user join chat
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  }
}