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

    const genderWord = childGender === 'boy' ? 'boy' : childGender === 'girl' ? 'girl' : 'child';
    const prompt = `You are analyzing a photo of a ${genderWord} child for a children's storybook illustration project.
Describe this ${genderWord}'s visual appearance in precise detail for an illustrator.
The child's name is ${childName}, age ${childAge}, ${childGender}.

Provide a CONCISE but DETAILED visual description covering:
1. Hair: EXACT color, style, length, texture (e.g. "short straight dark brown hair" or "short cropped black hair"). Be VERY specific about length — "short" vs "medium" vs "long" matters a lot for consistency across pages.
2. Skin tone: Use EXACT descriptions like "medium brown skin", "dark brown skin", "tan olive skin", "warm caramel skin", "deep brown skin". NEVER use vague terms.
3. Face shape and features (e.g. "round face, big brown eyes, thick eyebrows, small nose")
4. Gender: This is a ${genderWord}. Make sure the description clearly matches a ${genderWord}.

Then suggest a simple, memorable outfit:
- A specific colored t-shirt/top
- Specific pants/shorts/skirt
- The outfit should be gender-appropriate for a ${genderWord}

Format your response as TWO lines separated by "---":

LINE 1 (IDENTITY TAG): A SHORT 10-15 word phrase with the most critical identity features: hair + skin + eyes + gender.
Example for a boy: "short dark brown hair, medium brown skin, big brown eyes, ${genderWord}"
Example for a girl: "long black hair in pigtails, light brown skin, large dark eyes, ${genderWord}"

LINE 2 (FULL DESCRIPTION): The complete description including outfit, up to 50 words. MUST mention the gender.
Example: "A ${genderWord} with short straight dark brown hair, medium brown skin, round face with large dark brown eyes, thick eyebrows, small nose, wearing a bright orange t-shirt, khaki shorts, and white sneakers."

CRITICAL RULES:
- SKIN TONE and HAIR are the most important — be extremely specific
- Always mention the EXACT hair length (short/medium/long) — this prevents hair changing between pages
- Always include the gender word "${genderWord}" in both lines
- The identity tag will be repeated in EVERY image prompt to ensure the character looks the same across all 16 pages`;

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
    childGender?: string,
    layout?: string,
  ): Promise<string> {
    const genderTag = childGender === 'boy' ? 'boy' : childGender === 'girl' ? 'girl' : 'child';

    // DRAMATIC-IMAGE-ONLY pages: Generate scene WITHOUT face embedding.
    // These are cinematic landscape/action shots (dinosaur scenes, epic moments).
    // Using the "img" trigger here causes the child's face to appear on animals.
    // We still pass input_image (PhotoMaker requires it) but omit "img" from prompt
    // so the face is NOT embedded into any subject.
    if (layout === 'dramatic-image-only') {
      const sceneOnlyPrompt = `${imagePrompt}, 3d CGI, Pixar style, cinematic wide shot, detailed background, vibrant colors, epic scene`;
      this.logger.log(`Generating scene-only image (no face embed) for order ${orderId}, page ${pageNumber}`);
      this.logger.log(`Prompt: ${sceneOnlyPrompt.substring(0, 200)}...`);
      const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
      const imageUrl = await this.runSceneOnly(publicPhotoUrl, sceneOnlyPrompt);
      const filename = `${orderId}-page-${pageNumber}.png`;
      await this.downloadAndSave(imageUrl, filename);
      return `/uploads/${filename}`;
    }

    // For pages WITH the child: use PhotoMaker with face embedding
    // Remove all references to people from scene prompt
    let scenePrompt = imagePrompt;
    scenePrompt = scenePrompt
      .replace(/\b(the child|the kid|the boy|the girl|a child|a kid|a boy|a girl)\b/gi, '')
      .replace(/\b(his|her|their|he|she|they|him|them)\s+(mother|father|mom|dad|parent|parents|family|friend|friends|sister|brother|grandma|grandpa)\b/gi, '')
      .replace(/\b(a |the )?(woman|man|lady|guy|person|people|adult|adults|mother|father|mom|dad|parent|parents|family members|crowd|group of people)\b/gi, '')
      .replace(/\b(waving goodbye|hugging|holding hands with|standing with|walking with)\s+(a |the )?(woman|man|adult|parent|mother|father|person|child|kid|boy|girl)\b/gi, '')
      .replace(/\b(another child|second child|other child|two children|two kids|his friend|her friend|their friend)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Parse character description into identity tag + full description
    let identityTag = '';
    let fullDescription = '';
    if (characterDescription) {
      const parts = characterDescription.split('---').map((s: string) => s.trim());
      if (parts.length >= 2) {
        identityTag = parts[0];
        fullDescription = parts[1];
      } else {
        identityTag = characterDescription.substring(0, 80);
        fullDescription = characterDescription;
      }
    }

    // PROMPT STRUCTURE: Child identity FIRST via "img", then scene description integrated naturally.
    // The scene MUST be described richly to get detailed backgrounds (not just portrait).
    // Anti-chimera protection is handled by the negative prompt, not by separating child from scene.
    let fullPrompt: string;
    if (identityTag) {
      fullPrompt = `A img ${genderTag} child with ${identityTag}, in a scene: ${scenePrompt}, the child has ${fullDescription}`;
    } else {
      fullPrompt = `A img ${genderTag} child, in a scene: ${scenePrompt}`;
    }

    if (imageComposition) {
      fullPrompt = `${fullPrompt}. Composition: ${imageComposition}`;
    }

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

  /**
   * Generate a scene image WITHOUT face embedding.
   * Used for dramatic-image-only pages (dinosaur action, landscapes).
   * Still passes input_image (PhotoMaker requires it) but the prompt
   * does NOT contain the "img" trigger word, so the face is NOT applied.
   */
  private async runSceneOnly(faceImageUrl: string, prompt: string): Promise<string> {
    this.logger.log(`Running scene-only generation (no face embed): ${prompt.substring(0, 100)}...`);
    const output = await this.replicate.run(IMAGE_GEN_CONFIG.model as `${string}/${string}:${string}`, {
      input: {
        prompt,
        input_image: faceImageUrl,
        style_name: IMAGE_GEN_CONFIG.styleName,
        style_strength_ratio: IMAGE_GEN_CONFIG.styleStrengthRatio,
        num_steps: IMAGE_GEN_CONFIG.numSteps,
        guidance_scale: IMAGE_GEN_CONFIG.guidanceScale,
        num_outputs: IMAGE_GEN_CONFIG.numOutputs,
        negative_prompt: NEGATIVE_PROMPT + ', human face on animal, child face on dinosaur, human features on creature',
        disable_safety_checker: true,
      },
    });

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from Replicate');
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
