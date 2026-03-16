import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Replicate from 'replicate';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { STYLE_SUFFIX, NEGATIVE_PROMPT, IMAGE_GEN_CONFIG } from '@bookmagic/shared';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly replicate: Replicate;
  private cachedFileUrl = '';
  private cachedFilePath = '';

  constructor(private readonly config: ConfigService) {
    this.replicate = new Replicate({
      auth: this.config.getOrThrow<string>('REPLICATE_API_TOKEN'),
    });
  }

  async generateReferenceSheet(photoUrl: string, orderId: string): Promise<string> {
    const prompt = `Character reference sheet, full body, multiple angles, front view and side view, neutral pose, children's book character, ${STYLE_SUFFIX}`;

    const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
    this.logger.log(`Generating reference sheet for order ${orderId}`);
    const imageUrl = await this.runFluxPulid(publicPhotoUrl, prompt);
    const filename = `ref-${orderId}.png`;
    await this.downloadAndSave(imageUrl, filename);
    return `/uploads/${filename}`;
  }

  async generatePageImage(
    photoUrl: string,
    imagePrompt: string,
    orderId: string,
    pageNumber: number,
    imageComposition?: string,
  ): Promise<string> {
    let fullPrompt = imagePrompt.includes(STYLE_SUFFIX)
      ? imagePrompt
      : `${imagePrompt}, ${STYLE_SUFFIX}`;

    if (imageComposition) {
      fullPrompt = `${fullPrompt}. Composition: ${imageComposition}`;
    }

    const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
    this.logger.log(`Generating image for order ${orderId}, page ${pageNumber}`);
    const imageUrl = await this.runFluxPulid(publicPhotoUrl, fullPrompt);
    const filename = `${orderId}-page-${pageNumber}.png`;
    await this.downloadAndSave(imageUrl, filename);
    return `/uploads/${filename}`;
  }

  /**
   * Resolves local paths to publicly accessible URLs.
   * Uploads local files to Replicate's file hosting API so they can be
   * accessed by the model without needing ngrok or a public server.
   */
  private async resolvePublicUrl(url: string): Promise<string> {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Return cached URL if same file
    if (this.cachedFilePath === url && this.cachedFileUrl) {
      return this.cachedFileUrl;
    }

    // Upload local file to Replicate's file hosting
    const filePath = join(process.cwd(), url);
    this.logger.log(`Uploading local file to Replicate: ${url}`);

    const fileBuffer = await readFile(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('content', blob, 'photo.png');
    formData.append('content_type', 'image/png');

    const res = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.getOrThrow<string>('REPLICATE_API_TOKEN')}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload file to Replicate: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const fileUrl = data.urls?.get;
    if (!fileUrl) {
      throw new Error('No URL returned from Replicate file upload');
    }

    this.cachedFilePath = url;
    this.cachedFileUrl = fileUrl;
    this.logger.log(`File uploaded to Replicate: ${fileUrl}`);
    return fileUrl;
  }

  private async runFluxPulid(faceImageUrl: string, prompt: string): Promise<string> {
    const output = await this.replicate.run(IMAGE_GEN_CONFIG.model as `${string}/${string}:${string}`, {
      input: {
        prompt,
        main_face_image: faceImageUrl,
        id_weight: IMAGE_GEN_CONFIG.idWeight,
        start_step: IMAGE_GEN_CONFIG.startStep,
        num_steps: IMAGE_GEN_CONFIG.numSteps,
        width: IMAGE_GEN_CONFIG.width,
        height: IMAGE_GEN_CONFIG.height,
        guidance_scale: IMAGE_GEN_CONFIG.guidanceScale,
        negative_prompt: NEGATIVE_PROMPT,
      },
    });

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from Replicate');
  }

  private async downloadAndSave(url: string, filename: string): Promise<void> {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(join(UPLOADS_DIR, filename), buffer);
    this.logger.log(`Saved image: ${filename} (${Math.round(buffer.length / 1024)}KB)`);
  }
}
