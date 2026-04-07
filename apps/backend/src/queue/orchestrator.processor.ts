import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { StoryService } from '../story/story.service';
import { ImageService } from '../image/image.service';
import { EmailService } from '../email/email.service';
import { OrderStatus, StoryOutputInput } from '@bookmagic/shared';
import { ORCHESTRATOR_QUEUE, JobName } from './queue.constants';
import { getStaticStory } from '../story/static-stories';

@Processor(ORCHESTRATOR_QUEUE)
export class OrchestratorProcessor extends WorkerHost {
  private readonly logger = new Logger(OrchestratorProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly storyService: StoryService,
    private readonly imageService: ImageService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<void> {
    if (job.name === JobName.COMPLETE_ORDER) {
      return this.processComplete(job);
    }
    return this.processPreview(job);
  }

  /**
   * PREVIEW flow: generate story + reference sheet + 1 preview image
   */
  private async processPreview(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Processing preview for order ${orderId}`);

    try {
      // 1. Generate only 1 page of story (not the full book)
      await this.ordersService.updateStatus(orderId, OrderStatus.STORY_GENERATING);
      const order = await this.ordersService.findById(orderId);

      const previewStory = await this.storyService.generatePreviewPage(
        order.childName,
        order.childAge,
        order.childGender,
        order.theme,
        order.customStoryPrompt || undefined,
      );

      // Save the preview story (just title + 1 page)
      await this.prisma.order.update({
        where: { id: orderId },
        data: { storyJson: previewStory as any },
      });

      const previewPage = previewStory.pages[0];
      await this.prisma.page.create({
        data: {
          orderId,
          pageNumber: 1,
          text: previewPage.text,
          imagePrompt: previewPage.imagePrompt,
          sceneDescription: previewPage.sceneDescription,
          layout: previewPage.layout || 'full-bleed-text-bottom',
          status: 'PENDING',
        },
      });

      await this.ordersService.updateStatus(orderId, OrderStatus.STORY_COMPLETE);
      this.logger.log(`Preview story generated: "${previewStory.title}"`);

      // 2. Generate preview image (only 1)
      await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_GENERATING);

      // 2a. Character description
      let characterDescription = '';
      try {
        characterDescription = await this.imageService.describeCharacter(
          order.photoUrl,
          order.childName,
          order.childAge,
          order.childGender,
        );
        await this.prisma.order.update({
          where: { id: orderId },
          data: { characterDescription },
        });
        this.logger.log(`Character description generated for ${order.childName}`);
      } catch (error) {
        this.logger.warn(`Character description failed, continuing without it: ${(error as Error).message}`);
      }

      // 2b. Reference sheet
      const refUrl = await this.imageService.generateReferenceSheet(
        order.photoUrl,
        orderId,
        order.illustrationStyle,
      );
      await this.prisma.order.update({
        where: { id: orderId },
        data: { referenceSheetUrl: refUrl },
      });
      this.logger.log(`Reference sheet generated`);

      // 2c. Generate the single preview page image
      const page = await this.prisma.page.findFirst({
        where: { orderId },
        orderBy: { pageNumber: 'asc' },
      });

      if (page) {
        await this.processPageImage(
          orderId,
          order.photoUrl,
          page,
          undefined,
          characterDescription,
          order.childGender,
          page.layout,
          order.illustrationStyle,
        );
        this.logger.log(`Preview image generated for page ${page.pageNumber}`);
      }

      // Set status to PREVIEW_READY (with only 1 image)
      await this.ordersService.updateStatus(orderId, OrderStatus.PREVIEW_READY);
      this.logger.log(`Order ${orderId} preview ready — 1 sample image generated`);

    } catch (error) {
      this.logger.error(`Order ${orderId} preview failed: ${(error as Error).message}`);
      try {
        await this.ordersService.updateStatus(orderId, OrderStatus.FAILED);
      } catch {
        // status transition may fail if already in FAILED state
      }
      throw error;
    }
  }

  /**
   * COMPLETE flow: generate remaining images after payment
   */
  private async processComplete(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Completing full book for order ${orderId}`);

    try {
      const order = await this.ordersService.findById(orderId);
      const characterDescription = (order as any).characterDescription || '';

      // 1. Generate the FULL story (16 pages) — replacing the 1-page preview
      await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_GENERATING);

      const staticStory = getStaticStory(order.theme, order.childName, order.childAge, order.childGender);
      const story = staticStory
        ? staticStory
        : await this.storyService.generateStory(
            order.childName,
            order.childAge,
            order.childGender,
            order.theme,
            order.customStoryPrompt || undefined,
          );
      this.logger.log(`Full story generated: "${story.title}" — ${story.pages.length} pages`);

      // Save the full story JSON (replaces preview)
      await this.prisma.order.update({
        where: { id: orderId },
        data: { storyJson: story as any },
      });

      // Delete old preview page records
      await this.prisma.page.deleteMany({ where: { orderId } });

      // Create all page records
      const storyData = story as StoryOutputInput;
      for (const page of storyData.pages) {
        await this.prisma.page.create({
          data: {
            orderId,
            pageNumber: page.pageNumber,
            text: page.text,
            imagePrompt: page.imagePrompt,
            sceneDescription: page.sceneDescription,
            layout: page.layout || 'full-bleed-text-bottom',
            status: 'PENDING',
          },
        });
      }

      // 2. Generate all page images
      const pages = await this.prisma.page.findMany({
        where: { orderId },
        orderBy: { pageNumber: 'asc' },
      });

      for (const page of pages) {
        const storyPage = storyData.pages.find((p: any) => p.pageNumber === page.pageNumber);

        if (page.layout === 'chapter-title') {
          await this.prisma.page.update({
            where: { id: page.id },
            data: { status: 'COMPLETE' },
          });
          this.logger.log(`Page ${page.pageNumber} (chapter-title) — no image needed`);
          continue;
        }

        await this.processPageImage(
          orderId,
          order.photoUrl,
          page,
          storyPage?.imageComposition,
          characterDescription,
          order.childGender,
          page.layout,
          order.illustrationStyle,
        );
        // 12s delay between requests to stay within rate limit
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }

      // Retry failed pages once
      const failedPages = await this.prisma.page.findMany({
        where: { orderId, status: 'FAILED' },
        orderBy: { pageNumber: 'asc' },
      });
      if (failedPages.length > 0) {
        this.logger.log(`Retrying ${failedPages.length} failed pages...`);
        for (const page of failedPages) {
          const storyPage = storyData.pages.find((p: any) => p.pageNumber === page.pageNumber);
          await this.processPageImage(
            orderId,
            order.photoUrl,
            page,
            storyPage?.imageComposition,
            characterDescription,
            order.childGender,
            page.layout,
            order.illustrationStyle,
          );
          await new Promise((resolve) => setTimeout(resolve, 12000));
        }
      }

      // Check results
      const updatedPages = await this.prisma.page.findMany({
        where: { orderId },
      });
      const allComplete = updatedPages.every((p: any) => p.status === 'COMPLETE');

      if (allComplete) {
        await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_COMPLETE);
        await this.ordersService.updateStatus(orderId, OrderStatus.PDF_GENERATING);
        await this.ordersService.updateStatus(orderId, OrderStatus.PREVIEW_READY);
        this.logger.log(`Order ${orderId} complete — all images generated`);
        await this.sendBookReadyNotification(orderId, order, story.title);
      } else {
        const failedCount = updatedPages.filter((p: any) => p.status === 'FAILED').length;
        this.logger.warn(`Order ${orderId}: ${failedCount} pages failed`);
        if (failedCount <= 3) {
          await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_COMPLETE);
          await this.ordersService.updateStatus(orderId, OrderStatus.PDF_GENERATING);
          await this.ordersService.updateStatus(orderId, OrderStatus.PREVIEW_READY);
          await this.sendBookReadyNotification(orderId, order, story.title);
        } else {
          await this.ordersService.updateStatus(orderId, OrderStatus.FAILED);
        }
      }
    } catch (error) {
      this.logger.error(`Order ${orderId} completion failed: ${(error as Error).message}`);
      try {
        await this.ordersService.updateStatus(orderId, OrderStatus.FAILED);
      } catch {
        // already failed
      }
      throw error;
    }
  }

  private async sendBookReadyNotification(
    orderId: string,
    order: { userId?: string | null; email?: string | null; childName: string },
    storyTitle: string,
  ): Promise<void> {
    try {
      // Find recipient email: check order's user account, then order-level email
      let recipientEmail: string | null = null;

      if (order.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true },
        });
        recipientEmail = user?.email || null;
      }

      if (!recipientEmail && order.email) {
        recipientEmail = order.email;
      }

      if (!recipientEmail) {
        this.logger.warn(`No email found for order ${orderId} — skipping notification`);
        return;
      }

      await this.emailService.sendBookReadyEmail({
        to: recipientEmail,
        childName: order.childName,
        storyTitle,
        orderId,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification for order ${orderId}: ${(error as Error).message}`);
      // Never throw — notification failure must not affect order status
    }
  }

  private async processPageImage(
    orderId: string,
    photoUrl: string,
    page: { id: string; pageNumber: number; imagePrompt: string; layout?: string },
    imageComposition?: string,
    characterDescription?: string,
    childGender?: string,
    layout?: string,
    illustrationStyle?: string,
  ): Promise<void> {
    try {
      await this.prisma.page.update({
        where: { id: page.id },
        data: { status: 'GENERATING' },
      });

      const imageUrl = await this.imageService.generatePageImage(
        photoUrl,
        page.imagePrompt,
        orderId,
        page.pageNumber,
        imageComposition,
        characterDescription,
        childGender,
        layout || page.layout,
        illustrationStyle,
      );

      await this.prisma.page.update({
        where: { id: page.id },
        data: { imageUrl, status: 'COMPLETE' },
      });

      this.logger.log(`Page ${page.pageNumber} image complete`);
    } catch (error) {
      this.logger.error(`Page ${page.pageNumber} failed: ${(error as Error).message}`);
      await this.prisma.page.update({
        where: { id: page.id },
        data: {
          status: 'FAILED',
          retryCount: { increment: 1 },
        },
      });
    }
  }
}
