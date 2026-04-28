import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(data: Prisma.ContactMessageCreateInput) {
    try {
      return await this.prisma.contactMessage.create({
        data,
      });
    } catch (error) {
      console.error('Failed to save contact message', error);
      throw new InternalServerErrorException('Could not save contact message');
    }
  }
}
