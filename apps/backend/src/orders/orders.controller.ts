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
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { Response, Request } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createOrderSchema, CreateOrderInput } from '@bookmagic/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { OrdersService } from './orders.service';
import { RazorpayService } from './razorpay.service';
import { PdfService } from '../pdf/pdf.service';
import { CouponsService } from './coupons.service';
import { ORCHESTRATOR_QUEUE, JobName } from '../queue/queue.constants';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly couponsService: CouponsService,
    private readonly pdfService: PdfService,
    private readonly razorpayService: RazorpayService,
    @InjectQueue(ORCHESTRATOR_QUEUE) private readonly queue: Queue,
  ) {}

  @Post(':id/razorpay')
  async createRazorpayOrder(
    @Param('id') id: string,
    @Body('amount') amountFromClient?: number,
    @Body('shipping') shipping?: any,
    @Body('couponCode') couponCode?: string,
  ) {
    const order = await this.ordersService.findById(id);
    // Use strictly the subtotal from client, but ensure it never drops below the base eBook price.
    let amount = amountFromClient || 499; 
    if (amount < 499) {
      throw new BadRequestException('Invalid total amount. Order minimum is 499 INR.');
    }
    let discountAmount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      try {
        const validation = await this.couponsService.validateCoupon(couponCode, amount * 100, order.userId);
        discountAmount = validation.discountAmount; // in paise
        amount = Math.max(0, amount - (discountAmount / 100)); // amount is in INR
        couponId = validation.coupon.id;
      } catch (error) {
        // If coupon is invalid, we can either throw error or just log it
        // Depending on UX requirements. Let's throw for now so user knows.
        throw error;
      }
    }
    
    // Update shipping and coupon details if provided
    const updateData: any = {};
    if (shipping) {
      updateData.shippingName = `${shipping.firstName} ${shipping.lastName}`.trim();
      updateData.shippingLine1 = shipping.address1;
      updateData.shippingLine2 = shipping.address2;
      updateData.shippingCity = shipping.city;
      updateData.shippingState = shipping.state;
      updateData.shippingPostal = shipping.postcode;
      updateData.shippingCountry = shipping.country;
      updateData.shippingPhone = shipping.phone;
    }
    
    if (couponId) {
      updateData.couponId = couponId;
      updateData.discountAmount = discountAmount;
    }

    if (Object.keys(updateData).length > 0) {
      await this.ordersService.updateOrder(id, updateData);
    }

    // Handle 100% discount / free orders without calling Razorpay
    if (amount === 0) {
      if (order.status === 'PAID') {
        return { id: 'free_order', amount: 0, currency: 'INR' };
      }

      await this.ordersService.updateOrder(id, {
        paymentId: 'FREE_100_PCT_' + Math.random().toString(36).substring(7),
        paymentProvider: 'free',
        status: 'PAID',
        amountPaid: 0,
        currency: 'INR',
      });
      
      if (couponId) {
        await this.couponsService.incrementUsage(couponId);
      }
      
      await this.queue.add(
        JobName.COMPLETE_ORDER, 
        { orderId: id },
        { jobId: `free_${id}` }
      );
      
      return { id: 'free_order', amount: 0, currency: 'INR' };
    }

    const razorpayOrder = await this.razorpayService.createOrder(id, amount);
    
    await this.ordersService.updateOrder(id, {
      razorpayOrderId: razorpayOrder.id,
      amountPaid: Math.round(amount * 100), // stored in paise
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

    // Check if this EXACT payment ID was already processed across any order
    const existingPayment = await this.ordersService.findByPaymentId(body.razorpayPaymentId);
    if (existingPayment) {
      return { success: true, message: 'Payment already processed' };
    }

    const order = await this.ordersService.findById(body.orderId);

    if (order.paymentId) {
      return { success: true, message: 'Payment already processed' };
    }

    try {
      await this.ordersService.updateOrder(body.orderId, {
        paymentId: body.razorpayPaymentId,
        paymentProvider: 'razorpay',
        status: 'PAID',
      });
    } catch (error: any) {
      // P2002: Unique constraint failed on the fields: (`paymentId`)
      if (error.code === 'P2002') {
        return { success: true, message: 'Payment already processed' };
      }
      throw error;
    }

    // Increment coupon usage if a coupon was applied
    if ((order as any).couponId) {
      await this.couponsService.incrementUsage((order as any).couponId);
    }

    // Automatically trigger full book generation upon payment verification
    // Use the exact paymentId as the deterministic jobId to guarantee zero duplicate processing
    await this.queue.add(
      JobName.COMPLETE_ORDER, 
      { orderId: body.orderId },
      { jobId: body.razorpayPaymentId }
    );

    return { success: true };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  async create(@Req() req: Request, @Body() dto: CreateOrderInput) {
    const userId = (req.user as any)?.id;
    const order = await this.ordersService.create(dto, userId);
    await this.queue.add(
      JobName.PROCESS_ORDER, 
      { orderId: order.id },
      { jobId: `process_${order.id}` }
    );
    return order;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    const orders = await this.ordersService.findByUserId(userId);
    return { orders };
  }

  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async findAllAdmin() {
    const orders = await this.ordersService.findAllAdmin();
    return { orders };
  }

  @Get('admin/dashboard')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getAdminDashboardSimple() {
    return this.ordersService.getAdminDashboardStats();
  }

  @Get('admin/dashboard/stats')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getAdminDashboardStats() {
    const stats = await this.ordersService.getAdminDashboardStats();
    return stats;
  }

  @Get('admin/users')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async findAllAdminUsers() {
    const users = await this.ordersService.findAllAdminUsers();
    return { users };
  }

  @Get('admin/books')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async findAllAdminBooks() {
    const books = await this.ordersService.findAllAdminBooks();
    return { books };
  }

  @Get('admin/payments')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async findAllAdminPayments() {
    const payments = await this.ordersService.findAllAdminPayments();
    return { payments };
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

    // Idempotent: Only update and queue if not already paid/processing
    if (!order.paymentId) {
      await this.ordersService.updateStatus(id, 'PAID' as any);
      await this.queue.add(
        JobName.COMPLETE_ORDER, 
        { orderId: id },
        { jobId: `complete_${id}` }
      );
    }

    return { message: 'Full book generation started', orderId: id };
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const order = await this.ordersService.findById(id);

    if (!order.pages || order.pages.length === 0) {
      throw new NotFoundException('Book not ready for download yet');
    }

    // During testing/development, allow download even if not paid
    /*
    if (order.status !== 'PAID' && order.status !== 'DELIVERED') {
      throw new ForbiddenException('Please purchase access to download the PDF');
    }
    */

    try {
      const pdfBuffer = await this.pdfService.generateStorybook(order as any);
      const filename = `${order.childName.replace(/[^a-zA-Z0-9]/g, '_')}_storybook.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      throw new BadRequestException(`PDF generation failed: ${(error as Error).message}`);
    }
  }
}
