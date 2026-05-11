import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EmailService } from '../src/email/email.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);

  console.log('Attempting to send test email...');
  try {
    await emailService.sendBookReadyEmail({
      to: 'karthikpalanipk@gmail.com',
      childName: 'Test Child',
      storyTitle: 'Test Story',
      orderId: 'test-order-id',
    });
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
