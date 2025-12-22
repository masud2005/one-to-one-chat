import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message } from '@prisma';

@Injectable()
export class MessageService {
    constructor(private prisma: PrismaService) { }

    // নতুন message তৈরি করো
    async sendMessage(senderId: number, receiverId: number, content: string): Promise<Message> {
        
        return this.prisma.client.message.create({
            data: {
                content,
                senderId,
                receiverId,
                isRead: false, // নতুন message unread হিসেবে তৈরি হবে
            },
            include: {
                sender: true,
                receiver: true,
            },
        });
    }

    // দুই user এর মধ্যে সব messages নাও
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

    // Messages কে read mark করো
    async markMessagesAsRead(messageIds: number[]) {
        return this.prisma.client.message.updateMany({
            where: {
                id: { in: messageIds },
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    // Unread messages count নাও
    async getUnreadCount(userId: number, senderId: number) {
        return this.prisma.client.message.count({
            where: {
                receiverId: userId,
                senderId: senderId,
                isRead: false,
            },
        });
    }
}