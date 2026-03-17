import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { StoryService } from '../story/story.service';
import { ImageService } from '../image/image.service';
import { OrderStatus, StoryOutputInput } from '@bookmagic/shared';
import { ORCHESTRATOR_QUEUE } from './queue.constants';

@Processor(ORCHESTRATOR_QUEUE)
export class OrchestratorProcessor extends WorkerHost {
  private readonly logger = new Logger(OrchestratorProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly storyService: StoryService,
    private readonly imageService: ImageService,
  ) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Processing order ${orderId}`);

    try {
      // 1. Generate story
      await this.ordersService.updateStatus(orderId, OrderStatus.STORY_GENERATING);
      const order = await this.ordersService.findById(orderId);

      const story = await this.storyService.generateStory(
        order.childName,
        order.childAge,
        order.childGender,
        order.theme,
        order.customStoryPrompt || undefined,
      );

      // Save story JSON and create page records with layout
      await this.prisma.order.update({
        where: { id: orderId },
        data: { storyJson: story as any },
      });

      for (const page of story.pages) {
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

      await this.ordersService.updateStatus(orderId, OrderStatus.STORY_COMPLETE);
      this.logger.log(`Story generated: "${story.title}"`);

      // 2. Generate images
      await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_GENERATING);

      // 2a. Generate character description from the uploaded photo using Gemini Vision
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

      // 2b. Generate reference sheet
      const refUrl = await this.imageService.generateReferenceSheet(
        order.photoUrl,
        orderId,
      );
      await this.prisma.order.update({
        where: { id: orderId },
        data: { referenceSheetUrl: refUrl },
      });
      this.logger.log(`Reference sheet generated`);

      // 2c. Generate page images sequentially with character description
      const pages = await this.prisma.page.findMany({
        where: { orderId },
        orderBy: { pageNumber: 'asc' },
      });

      const storyData = story as StoryOutputInput;

      for (const page of pages) {
        const storyPage = storyData.pages.find((p: any) => p.pageNumber === page.pageNumber);

        // Skip image generation for chapter-title pages (no illustration needed)
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
        );
        // 12s delay between requests to stay within rate limit
        await new Promise((resolve) => setTimeout(resolve, 12000));
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
      } else {
        const failedCount = updatedPages.filter((p: any) => p.status === 'FAILED').length;
        this.logger.warn(`Order ${orderId}: ${failedCount} pages failed`);
        // Still mark as preview-ready if most pages succeeded
        if (failedCount <= 3) {
          await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_COMPLETE);
          await this.ordersService.updateStatus(orderId, OrderStatus.PDF_GENERATING);
          await this.ordersService.updateStatus(orderId, OrderStatus.PREVIEW_READY);
          this.logger.log(`Order ${orderId} — preview ready with ${failedCount} missing pages`);
        } else {
          await this.ordersService.updateStatus(orderId, OrderStatus.FAILED);
        }
      }
    } catch (error) {
      this.logger.error(`Order ${orderId} failed: ${(error as Error).message}`);
      try {
        await this.ordersService.updateStatus(orderId, OrderStatus.FAILED);
      } catch {
        // status transition may fail if already in FAILED state
      }
      throw error;
    }
  }

  private async processPageImage(
    orderId: string,
    photoUrl: string,
    page: { id: string; pageNumber: number; imagePrompt: string },
    imageComposition?: string,
    characterDescription?: string,
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
