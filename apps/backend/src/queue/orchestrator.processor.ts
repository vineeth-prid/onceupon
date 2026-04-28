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
      const isFamilyMode = order.familyMode && order.familyMembers && order.familyMembers.length >= 2;

      // Build familyMembers info for story generation if in family mode
      const familyMembersInfo = isFamilyMode
        ? order.familyMembers.map((m: any) => ({ role: m.role, name: m.name, age: m.age, gender: m.gender }))
        : undefined;

      const previewStory = await this.storyService.generatePreviewPage(
        order.childName,
        order.childAge,
        order.childGender,
        order.theme,
        order.customStoryPrompt || undefined,
        familyMembersInfo,
      );

      // Save the preview story (just title + 1 page)
      await this.prisma.order.update({
        where: { id: orderId },
        data: { storyJson: previewStory as any },
      });

      const previewPage = previewStory.pages[0];

      // Delete any existing pages from prior attempts before creating new ones
      await this.prisma.page.deleteMany({ where: { orderId } });

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
      this.logger.log(`Preview story generated: "${previewStory.title}"${isFamilyMode ? ' (family mode)' : ''}`);

      // 2. Generate preview image (only 1)
      await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_GENERATING);

      if (isFamilyMode) {
        // ─── Family Mode Preview ───
        // 2a. Describe all family members (keyed by member ID, not role)
        const descriptions = await this.imageService.describeMultipleCharacters(order.familyMembers as any);

        // Save descriptions to each FamilyMember record by ID
        for (const member of order.familyMembers) {
          const desc = descriptions.get((member as any).id) || '';
          if (desc) {
            await this.prisma.familyMember.update({
              where: { id: (member as any).id },
              data: { characterDescription: desc },
            });
          }
        }

        // Also save main child description to order for backward compat
        const mainChild = order.familyMembers.find((m: any) => m.role === 'MAIN_CHILD');
        const mainChildDesc = mainChild ? (descriptions.get((mainChild as any).id) || '') : '';
        await this.prisma.order.update({
          where: { id: orderId },
          data: { characterDescription: mainChildDesc },
        });

        // 2b. Reference sheet (main child only)
        const refUrl = await this.imageService.generateReferenceSheet(
          mainChild ? (mainChild as any).croppedPhotoUrl : order.photoUrl,
          orderId,
          order.illustrationStyle,
        );
        await this.prisma.order.update({
          where: { id: orderId },
          data: { referenceSheetUrl: refUrl },
        });

        // 2c. Generate family preview image
        const page = await this.prisma.page.findFirst({
          where: { orderId },
          orderBy: { pageNumber: 'asc' },
        });

        if (page) {
          const charactersInScene = (previewPage as any).charactersInScene ||
            order.familyMembers.map((m: any) => m.role);

          // Include gender and name for each member so the image pipeline
          // can build gender-specific prompts (man vs woman)
          const membersWithDescriptions = order.familyMembers.map((m: any) => ({
            role: m.role,
            gender: m.gender,
            name: m.name,
            croppedPhotoUrl: m.croppedPhotoUrl,
            characterDescription: descriptions.get(m.id) || m.characterDescription,
          }));

          await this.processFamilyPageImage(
            orderId,
            membersWithDescriptions,
            page,
            charactersInScene,
            undefined,
            mainChildDesc,
            order.childGender,
            page.layout,
            order.illustrationStyle,
          );

          const updatedPage = await this.prisma.page.findUnique({ where: { id: page.id } });
          if (updatedPage?.status === 'FAILED') {
            this.logger.warn(`Family preview image failed, retrying once...`);
            await this.processFamilyPageImage(
              orderId,
              membersWithDescriptions,
              page,
              charactersInScene,
              undefined,
              mainChildDesc,
              order.childGender,
              page.layout,
              order.illustrationStyle,
            );

            const retriedPage = await this.prisma.page.findUnique({ where: { id: page.id } });
            if (retriedPage?.status === 'FAILED') {
              throw new Error(`Family preview image generation failed after retry`);
            }
          }
        }
      } else {
        // ─── Solo Mode Preview (unchanged) ───
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

          const updatedPage = await this.prisma.page.findUnique({ where: { id: page.id } });
          if (updatedPage?.status === 'FAILED') {
            this.logger.warn(`Preview image failed for page ${page.pageNumber}, retrying once...`);
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

            const retriedPage = await this.prisma.page.findUnique({ where: { id: page.id } });
            if (retriedPage?.status === 'FAILED') {
              throw new Error(`Preview image generation failed after retry for page ${page.pageNumber}`);
            }
          }

          this.logger.log(`Preview image generated for page ${page.pageNumber}`);
        }
      }

      // Set status to PREVIEW_READY (with only 1 image)
      await this.ordersService.updateStatus(orderId, OrderStatus.PREVIEW_READY);
      this.logger.log(`Order ${orderId} preview ready — 1 sample image generated${isFamilyMode ? ' (family mode)' : ''}`);

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
      const isFamilyMode = order.familyMode && order.familyMembers && order.familyMembers.length >= 2;

      // 1. Generate the FULL story (16 pages) — replacing the 1-page preview
      await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_GENERATING);

      const familyMembersInfo = isFamilyMode
        ? order.familyMembers.map((m: any) => ({ role: m.role, name: m.name, age: m.age, gender: m.gender }))
        : undefined;

      const existingStory = order.storyJson as unknown as StoryOutputInput | null;
      const isFullStoryAlreadyGenerated = existingStory && existingStory.pages && existingStory.pages.length > 1;
      let storyData: StoryOutputInput;

      if (!isFullStoryAlreadyGenerated) {
        const staticStory = getStaticStory(order.theme, order.childName, order.childAge, order.childGender);
        const story = staticStory
          ? staticStory
          : await this.storyService.generateStory(
              order.childName,
              order.childAge,
              order.childGender,
              order.theme,
              order.customStoryPrompt || undefined,
              familyMembersInfo,
            );
        this.logger.log(`Full story generated: "${story.title}" — ${story.pages.length} pages${isFamilyMode ? ' (family mode)' : ''}`);

        // Save the full story JSON (replaces preview)
        await this.prisma.order.update({
          where: { id: orderId },
          data: { storyJson: story as any },
        });

        // Delete old preview page records
        await this.prisma.page.deleteMany({ where: { orderId } });

        // Create all page records
        storyData = story as StoryOutputInput;
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
      } else {
        storyData = existingStory;
        this.logger.log(`Reusing already generated full story: "${storyData.title}"`);
      }

      // 2. Generate all page images
      const pages = await this.prisma.page.findMany({
        where: { orderId },
        orderBy: { pageNumber: 'asc' },
      });

      // Build family members with descriptions AND gender for family mode
      const membersWithDescriptions = isFamilyMode
        ? order.familyMembers.map((m: any) => ({
            role: m.role,
            gender: m.gender,
            name: m.name,
            croppedPhotoUrl: m.croppedPhotoUrl,
            characterDescription: m.characterDescription,
          }))
        : [];

      // Delay between pages: 18s for family mode (more API calls), 12s for solo
      const pageDelay = isFamilyMode ? 18000 : 12000;

      for (const page of pages) {
        if (page.status === 'COMPLETE') continue;

        const storyPage = storyData.pages.find((p: any) => p.pageNumber === page.pageNumber);

        if (page.layout === 'chapter-title') {
          await this.prisma.page.update({
            where: { id: page.id },
            data: { status: 'COMPLETE' },
          });
          this.logger.log(`Page ${page.pageNumber} (chapter-title) — no image needed`);
          continue;
        }

        if (isFamilyMode) {
          // Family mode: use two-stage pipeline (PhotoMaker + Easel face swap)
          const charactersInScene = (storyPage as any)?.charactersInScene ||
            order.familyMembers.map((m: any) => m.role);

          await this.processFamilyPageImage(
            orderId,
            membersWithDescriptions,
            page,
            charactersInScene,
            storyPage?.imageComposition,
            characterDescription,
            order.childGender,
            page.layout,
            order.illustrationStyle,
          );
        } else {
          // Solo mode: standard single-person pipeline
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
        }

        await new Promise((resolve) => setTimeout(resolve, pageDelay));
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

          if (isFamilyMode) {
            const charactersInScene = (storyPage as any)?.charactersInScene ||
              order.familyMembers.map((m: any) => m.role);
            await this.processFamilyPageImage(
              orderId,
              membersWithDescriptions,
              page,
              charactersInScene,
              storyPage?.imageComposition,
              characterDescription,
              order.childGender,
              page.layout,
              order.illustrationStyle,
            );
          } else {
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
          }

          await new Promise((resolve) => setTimeout(resolve, pageDelay));
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
        await this.ordersService.updateStatus(orderId, OrderStatus.ORDER_CONFIRMED);
        this.logger.log(`Order ${orderId} complete — all images generated`);
        await this.sendBookReadyNotification(orderId, order, storyData.title);
      } else {
        const failedCount = updatedPages.filter((p: any) => p.status === 'FAILED').length;
        this.logger.warn(`Order ${orderId}: ${failedCount} pages failed`);
        if (failedCount <= 3) {
          await this.ordersService.updateStatus(orderId, OrderStatus.IMAGES_COMPLETE);
          await this.ordersService.updateStatus(orderId, OrderStatus.PDF_GENERATING);
          await this.ordersService.updateStatus(orderId, OrderStatus.ORDER_CONFIRMED);
          await this.sendBookReadyNotification(orderId, order, storyData.title);
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

  private async processFamilyPageImage(
    orderId: string,
    familyMembers: Array<{ role: string; croppedPhotoUrl: string; characterDescription?: string | null }>,
    page: { id: string; pageNumber: number; imagePrompt: string; layout?: string },
    charactersInScene: string[],
    imageComposition?: string,
    primaryCharacterDescription?: string,
    primaryGender?: string,
    layout?: string,
    illustrationStyle?: string,
  ): Promise<void> {
    try {
      await this.prisma.page.update({
        where: { id: page.id },
        data: { status: 'GENERATING' },
      });

      const mainChild = familyMembers.find((m) => m.role === 'MAIN_CHILD');
      const primaryPhotoUrl = mainChild?.croppedPhotoUrl || '';

      const imageUrl = await this.imageService.generateFamilyPageImage(
        primaryPhotoUrl,
        familyMembers,
        page.imagePrompt,
        charactersInScene,
        orderId,
        page.pageNumber,
        imageComposition,
        primaryCharacterDescription,
        primaryGender,
        layout || page.layout,
        illustrationStyle,
      );

      await this.prisma.page.update({
        where: { id: page.id },
        data: { imageUrl, status: 'COMPLETE' },
      });

      this.logger.log(`Page ${page.pageNumber} family image complete`);
    } catch (error) {
      this.logger.error(`Page ${page.pageNumber} family image failed: ${(error as Error).message}`);
      await this.prisma.page.update({
        where: { id: page.id },
        data: {
          status: 'FAILED',
          retryCount: { increment: 1 },
        },
      });
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
