import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Replicate from 'replicate';
import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { NEGATIVE_PROMPT, IMAGE_GEN_CONFIG } from '@bookmagic/shared';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly replicate: Replicate;
  private readonly genai: GoogleGenAI;
  private cachedFileUrl = '';
  private cachedFilePath = '';

  constructor(private readonly config: ConfigService) {
    this.replicate = new Replicate({
      auth: this.config.getOrThrow<string>('REPLICATE_API_TOKEN'),
    });
    this.genai = new GoogleGenAI({
      apiKey: this.config.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  /**
   * Analyze the child's photo using Gemini Vision to extract a detailed
   * character description for consistent image generation across all pages.
   */
  async describeCharacter(photoUrl: string, childName: string, childAge: number, childGender: string): Promise<string> {
    this.logger.log(`Describing character from photo for ${childName}`);

    const filePath = photoUrl.startsWith('/') ? join(process.cwd(), photoUrl) : photoUrl;
    const imageBytes = await readFile(filePath);
    const base64Image = imageBytes.toString('base64');

    const prompt = `You are analyzing a photo of a child for a children's storybook illustration project.
Describe this child's visual appearance in precise detail for an illustrator.
The child's name is ${childName}, age ${childAge}, ${childGender}.

Provide a CONCISE but DETAILED visual description covering:
1. Hair: color, style, length, texture (e.g. "short spiky dark brown hair")
2. Skin tone (e.g. "warm brown skin", "light peach skin")
3. Face shape and features (e.g. "round face, big brown eyes, small nose, rosy cheeks")
4. Build (e.g. "small and slim for a 5-year-old")

Then suggest a simple, memorable outfit that fits the character for a storybook:
- A specific colored t-shirt/top
- Specific pants/shorts/skirt
- Shoes

CRITICAL: Be extremely specific about SKIN TONE — this is the most important detail.
Use exact descriptions like "medium brown skin", "dark brown skin", "tan olive skin", "warm caramel skin", "deep brown skin" etc.
Do NOT use vague terms like "warm skin" — always include the actual color.

Format your response as a single paragraph, like:
"[hair description], [EXACT skin tone color], [face features], wearing [outfit description]."

Keep it under 60 words. Start with hair, then skin, then face. No name needed.
This will be injected directly after "A img child," in every image prompt.`;

    const response = await this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      }],
    });

    const description = response.text?.trim() || '';
    this.logger.log(`Character description: ${description}`);
    return description;
  }

  async generateReferenceSheet(photoUrl: string, orderId: string): Promise<string> {
    const prompt = `A full body character reference sheet of a img child, multiple angles, front view and side view, neutral pose, 3d CGI, Pixar style, children's book character`;

    const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
    this.logger.log(`Generating reference sheet for order ${orderId}`);
    const imageUrl = await this.runPhotoMaker(publicPhotoUrl, prompt);
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
    characterDescription?: string,
  ): Promise<string> {
    // Build prompt with character description FIRST, then scene
    // PhotoMaker uses both the "img" face embedding AND text description.
    // If text says "light skin" but photo has "dark skin", text wins.
    // So we MUST explicitly describe the child's actual features.

    // Remove all references to people from scene prompt to prevent PhotoMaker
    // from generating extra/different characters. Only ONE person: the img child.
    let scenePrompt = imagePrompt;
    scenePrompt = scenePrompt
      .replace(/\b(the child|the kid|the boy|the girl|a child|a kid|a boy|a girl)\b/gi, '')
      .replace(/\b(his|her|their|he|she|they|him|them)\s+(mother|father|mom|dad|parent|parents|family|friend|friends|sister|brother|grandma|grandpa)\b/gi, '')
      .replace(/\b(a |the )?(woman|man|lady|guy|person|people|adult|adults|mother|father|mom|dad|parent|parents|family members|crowd|group of people)\b/gi, '')
      .replace(/\b(waving goodbye|hugging|holding hands with|standing with|walking with)\s+(a |the )?(woman|man|adult|parent|mother|father|person)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Build prompt: "A img child, [physical features], in a scene: [scene without child references]"
    let fullPrompt: string;
    if (characterDescription) {
      fullPrompt = `A img child, ${characterDescription}, in a scene: ${scenePrompt}`;
    } else {
      fullPrompt = `A img child in a scene: ${scenePrompt}`;
    }

    // Add composition guidance
    if (imageComposition) {
      fullPrompt = `${fullPrompt}. Composition: ${imageComposition}`;
    }

    // Add 3D Pixar/Disney scene quality keywords
    fullPrompt = `${fullPrompt}, 3d CGI, Pixar style, detailed background, full scene illustration, vibrant colors`;

    const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
    this.logger.log(`Generating image for order ${orderId}, page ${pageNumber}`);
    this.logger.log(`Prompt: ${fullPrompt.substring(0, 200)}...`);
    const imageUrl = await this.runPhotoMaker(publicPhotoUrl, fullPrompt);
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

  private async runPhotoMaker(faceImageUrl: string, prompt: string): Promise<string> {
    this.logger.log(`Running PhotoMaker with prompt: ${prompt.substring(0, 100)}...`);
    const output = await this.replicate.run(IMAGE_GEN_CONFIG.model as `${string}/${string}:${string}`, {
      input: {
        prompt,
        input_image: faceImageUrl,
        style_name: IMAGE_GEN_CONFIG.styleName,
        style_strength_ratio: IMAGE_GEN_CONFIG.styleStrengthRatio,
        num_steps: IMAGE_GEN_CONFIG.numSteps,
        guidance_scale: IMAGE_GEN_CONFIG.guidanceScale,
        num_outputs: IMAGE_GEN_CONFIG.numOutputs,
        negative_prompt: NEGATIVE_PROMPT,
        disable_safety_checker: true,
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
