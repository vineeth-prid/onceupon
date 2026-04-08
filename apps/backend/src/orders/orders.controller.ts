import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  Res,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createOrderSchema, CreateOrderInput } from '@bookmagic/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { OrdersService } from './orders.service';
import { RazorpayService } from './razorpay.service';
import { PdfService } from '../pdf/pdf.service';
import { ORCHESTRATOR_QUEUE, JobName } from '../queue/queue.constants';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pdfService: PdfService,
    private readonly razorpayService: RazorpayService,
    @InjectQueue(ORCHESTRATOR_QUEUE) private readonly queue: Queue,
  ) {}

  @Post(':id/razorpay')
  async createRazorpayOrder(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    // Fixed amount for now, e.g., ₹499
    const amount = 499; 
    const razorpayOrder = await this.razorpayService.createOrder(id, amount);
    
    await this.ordersService.updateOrder(id, {
      razorpayOrderId: razorpayOrder.id,
      amountPaid: amount * 100, // stored in paise
      currency: 'INR',
    });

    return razorpayOrder;
  }

  @Post('razorpay/verify')
  async verifyRazorpayPayment(
    @Body() body: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) {
    const isValid = this.razorpayService.verifyPayment(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    await this.ordersService.updateOrder(body.orderId, {
      paymentId: body.razorpayPaymentId,
      paymentProvider: 'razorpay',
      status: 'PAID',
    });

    return { success: true };
  }

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

    // Must be paid to download
    if (order.status !== 'PAID' && order.status !== 'DELIVERED') {
      throw new ForbiddenException('Please purchase access to download the PDF');
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
