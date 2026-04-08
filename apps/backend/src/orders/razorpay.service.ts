import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(id: string, amount: number, currency: string = 'INR') {
    try {
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise, ensure integer
        currency: currency,
        receipt: `rcpt_${id.replace(/-/g, '')}`.substring(0, 40),
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating Razorpay order: ${errorMessage}`);
      throw error;
    }
  }

  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new Error('RAZORPAY_KEY_SECRET is not defined');
    }
    const body = razorpayOrderId + '|' + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}
