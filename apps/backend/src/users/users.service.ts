import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAddresses(userId: string) {
    console.log(`Fetching addresses for user: ${userId}`);
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAddress(userId: string, data: any) {
    console.log(`Adding address for user: ${userId}`, data);
    if (data.postalCode && !/^\d{6}$/.test(data.postalCode)) {
      throw new BadRequestException('Postal code must be exactly 6 digits');
    }
    if (data.phone && !/^\d{12}$/.test(data.phone)) {
      throw new BadRequestException('Phone number must be exactly 12 digits (including country code)');
    }

    try {
      if (data.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const result = await this.prisma.address.create({
        data: {
          label: data.label || 'Home',
          firstName: data.firstName,
          lastName: data.lastName,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state || null,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone || null,
          isDefault: !!data.isDefault,
          userId,
        },
      });
      console.log('Address created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Error in addAddress:', error);
      throw error;
    }
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException('Address not found');

    if (data.postalCode && !/^\d{6}$/.test(data.postalCode)) {
      throw new BadRequestException('Postal code must be exactly 6 digits');
    }
    if (data.phone && !/^\d{12}$/.test(data.phone)) {
      throw new BadRequestException('Phone number must be exactly 12 digits (including country code)');
    }

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: {
        label: data.label,
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault !== undefined ? !!data.isDefault : undefined,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException('Address not found');

    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
