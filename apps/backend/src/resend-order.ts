import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EmailService } from './email/email.service';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);
  const prisma = app.get(PrismaService);

  const orderId = '5e2b66eb-78d0-4ff9-854b-5fe148ad3bac';
  
  console.log(`Searching for order ${orderId}...`);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    console.error('Order not found!');
    await app.close();
    return;
  }

  const storyData = order.storyJson as any || {};
  const storyTitle = storyData.title || 'Your Personalized Story';
  const recipient = order.email || 'karthikpalanipk@gmail.com';

  console.log(`Sending email to ${recipient} for story: "${storyTitle}"`);

  await emailService.sendBookReadyEmail({
    to: recipient,
    childName: order.childName,
    storyTitle: storyTitle,
    orderId: order.id,
  });

  console.log('✅ Email sent successfully!');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Failed to send email:', err);
  process.exit(1);
});
