import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  Res,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
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
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  async create(@Req() req: Request, @Body() dto: CreateOrderInput) {
    const userId = (req.user as any)?.id;
    const order = await this.ordersService.create(dto, userId);
    await this.queue.add(JobName.PROCESS_ORDER, { orderId: order.id });
    return order;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    const orders = await this.ordersService.findByUserId(userId);
    return { orders };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    const progress = this.ordersService.getProgress(order);
    return { order, progress };
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard('jwt'))
  async completeOrder(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);

    // Mark as paid and queue the full generation
    await this.ordersService.updateStatus(id, 'PAID' as any);
    await this.queue.add(JobName.COMPLETE_ORDER, { orderId: id });

    return { message: 'Full book generation started', orderId: id };
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
