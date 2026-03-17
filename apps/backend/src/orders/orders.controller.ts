import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createOrderSchema, CreateOrderInput } from '@bookmagic/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { OrdersService } from './orders.service';
import { PdfService } from '../pdf/pdf.service';
import { ORCHESTRATOR_QUEUE, JobName } from '../queue/queue.constants';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pdfService: PdfService,
    @InjectQueue(ORCHESTRATOR_QUEUE) private readonly queue: Queue,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  async create(@Body() dto: CreateOrderInput) {
    const order = await this.ordersService.create(dto);
    await this.queue.add(JobName.PROCESS_ORDER, { orderId: order.id });
    return order;
  }

  @Get()
  async findAll() {
    const orders = await this.ordersService.findAll();
    return { orders };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    const progress = this.ordersService.getProgress(order);
    return { order, progress };
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const order = await this.ordersService.findById(id);

    if (!order.pages || order.pages.length === 0) {
      throw new NotFoundException('Book not ready for download yet');
    }

    const pdfBuffer = await this.pdfService.generateStorybook(order as any);
    const filename = `${order.childName.replace(/[^a-zA-Z0-9]/g, '_')}_storybook.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
