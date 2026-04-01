import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../database/prisma.service';

const mockPrisma = {
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with CREATED status', async () => {
      const dto = {
        childName: 'Aarav',
        childAge: 5,
        childGender: 'boy' as const,
        theme: 'pirate-quest',
        illustrationStyle: 'disney-character',
        photoUrl: 'https://example.com/photo.jpg',
      };
      const expected = { id: 'uuid-1', ...dto, status: 'CREATED' };
      mockPrisma.order.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: { ...dto, status: 'CREATED' },
      });
    });
  });

  describe('findById', () => {
    it('should return order with pages', async () => {
      const order = { id: 'uuid-1', status: 'CREATED', pages: [] };
      mockPrisma.order.findUnique.mockResolvedValue(order);

      const result = await service.findById('uuid-1');
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException for missing order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid transition CREATED -> STORY_GENERATING', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'uuid-1', status: 'CREATED' });
      mockPrisma.order.update.mockResolvedValue({ id: 'uuid-1', status: 'STORY_GENERATING' });

      const result = await service.updateStatus('uuid-1', 'STORY_GENERATING' as any);
      expect(result.status).toBe('STORY_GENERATING');
    });

    it('should reject invalid transition CREATED -> PAID', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'uuid-1', status: 'CREATED' });

      await expect(
        service.updateStatus('uuid-1', 'PAID' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing', 'STORY_GENERATING' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProgress', () => {
    it('should return correct progress for partially completed order', () => {
      const order = {
        status: 'IMAGES_GENERATING',
        pages: [
          { status: 'COMPLETE' },
          { status: 'COMPLETE' },
          { status: 'GENERATING' },
          { status: 'PENDING' },
        ],
      };

      const progress = service.getProgress(order);
      expect(progress).toEqual({
        status: 'IMAGES_GENERATING',
        completedPages: 2,
        totalPages: 4,
      });
    });

    it('should default totalPages to 16 when no pages exist', () => {
      const progress = service.getProgress({ status: 'CREATED', pages: [] });
      expect(progress.totalPages).toBe(16);
    });
  });
});
