import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message } from '@prisma';

@Injectable()
export class MessageService {
    constructor(private prisma: PrismaService) { }

    async sendMessage(senderId: number, receiverId: number, content: string): Promise<Message> {
        
        return this.prisma.client.message.create({
            data: {
                content,
                senderId,
                receiverId,
            },
            include: {
                sender: true,
                receiver: true,
            },
        });
    }

    async getChatBetween(user1Id: number, user2Id: number) {
        return this.prisma.client.message.findMany({
            where: {
                OR: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id },
                ],
            },
            include: {
                sender: true,
                receiver: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}