import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Replicate from 'replicate';
import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { NEGATIVE_PROMPT, IMAGE_GEN_CONFIG, ILLUSTRATION_STYLES } from '@bookmagic/shared';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

type StyleConfig = (typeof ILLUSTRATION_STYLES)[number] & {
  replicateModel?: string;
  replicateStyle?: string;
  photoMakerStyleName?: string;
};

function getStyleConfig(styleId?: string): StyleConfig {
  const style = ILLUSTRATION_STYLES.find((s: any) => s.id === styleId);
  return (style || ILLUSTRATION_STYLES[0]) as StyleConfig;
}

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

    const filePath = photoUrl.startsWith('/')
      ? join(UPLOADS_DIR, photoUrl.replace(/^\/(?:api\/)?uploads\//, ''))
      : photoUrl;
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
      model: 'gemini-flash-latest',
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

  async generateReferenceSheet(photoUrl: string, orderId: string, illustrationStyle?: string): Promise<string> {
    const style = getStyleConfig(illustrationStyle);
    const prompt = `A full body character reference sheet of a img child, multiple angles, front view and side view, neutral pose, ${style.promptSuffix}, children's book character`;

    const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
    this.logger.log(`Generating reference sheet for order ${orderId} (style: ${style.id})`);
    const imageUrl = await this.runPhotoMaker(publicPhotoUrl, prompt, style.photoMakerStyleName);
    const filename = `ref-${orderId}.png`;
    await this.downloadAndSave(imageUrl, filename);
    return `/api/uploads/${filename}`;
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
    illustrationStyle?: string,
  ): Promise<string> {
    const genderTag = childGender === 'boy' ? 'boy' : childGender === 'girl' ? 'girl' : 'child';
    const style = getStyleConfig(illustrationStyle);

    // DRAMATIC-IMAGE-ONLY pages: Generate scene WITHOUT face embedding.
    if (layout === 'dramatic-image-only') {
      const sceneOnlyPrompt = `A img scene, ${imagePrompt}, ${style.promptSuffix}, cinematic wide shot, detailed background, epic scene`;
      this.logger.log(`Generating scene-only image (no face embed) for order ${orderId}, page ${pageNumber}`);
      this.logger.log(`Prompt: ${sceneOnlyPrompt.substring(0, 200)}...`);
      const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
      const imageUrl = await this.runSceneOnly(publicPhotoUrl, sceneOnlyPrompt, style.photoMakerStyleName);
      const filename = `${orderId}-page-${pageNumber}.png`;
      await this.downloadAndSave(imageUrl, filename);
      return `/api/uploads/${filename}`;
    }

    // For pages WITH the child: use PhotoMaker with face embedding
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

    const imgKeyword = style.replicateModel ? '' : 'img ';
    let fullPrompt: string;
    if (identityTag) {
      fullPrompt = `A ${imgKeyword}${genderTag} child with ${identityTag}, in a scene: ${scenePrompt}, the child has ${fullDescription}`;
    } else {
      fullPrompt = `A ${imgKeyword}${genderTag} child, in a scene: ${scenePrompt}`;
    }

    if (imageComposition) {
      fullPrompt = `${fullPrompt}. Composition: ${imageComposition}`;
    }

    // Prioritize style by moving suffix to the beginning if it exists
    if (style.promptSuffix) {
      fullPrompt = `${style.promptSuffix}, ${fullPrompt}`;
    }

    const publicPhotoUrl = await this.resolvePublicUrl(photoUrl);
    this.logger.log(`Generating image for order ${orderId}, page ${pageNumber} (style: ${style.id})`);
    this.logger.log(`Prompt: ${fullPrompt.substring(0, 200)}...`);

    let imageUrl: string;
    
    const styleObj = style as any;
    if (styleObj.replicateModel?.includes('photomaker')) {
      this.logger.log(`Routing to PhotoMaker with style: ${styleObj.photoMakerStyleName || '(No style)'}`);
      imageUrl = await this.runPhotoMaker(publicPhotoUrl, fullPrompt, styleObj.photoMakerStyleName || '(No style)');
    } else if (styleObj.replicateModel?.includes('gouache-folk-style')) {
      this.logger.log(`Routing to Gouache Folk Style with model: ${styleObj.replicateModel}`);
      imageUrl = await this.runImageToImage(publicPhotoUrl, fullPrompt, styleObj.replicateModel!);
    } else if (styleObj.replicateModel?.includes('claymation')) {
      this.logger.log(`Routing to Claymation with model: ${styleObj.replicateModel}`);
      imageUrl = await this.runImageToImage(publicPhotoUrl, fullPrompt, styleObj.replicateModel!);
    } else if (styleObj.replicateModel?.includes('stickergp')) {
      this.logger.log(`Routing to StickerGP with model: ${styleObj.replicateModel}`);
      imageUrl = await this.runFluxDev(fullPrompt, styleObj.replicateModel!);
    } else if (styleObj.replicateModel?.includes('flux-watercolor')) {
      this.logger.log(`Routing to FluxWatercolor`);
      imageUrl = await this.runFluxWatercolor(publicPhotoUrl, fullPrompt);
    } else if (styleObj.replicateModel?.includes('flux-dev')) {
      this.logger.log(`Routing to FluxDev with model: ${styleObj.replicateModel}`);
      imageUrl = await this.runFluxDev(fullPrompt, styleObj.replicateModel!);
    } else if (styleObj.replicateModel?.includes('face-to-many')) {
      this.logger.log(`Routing to FaceToMany with model: ${styleObj.replicateModel}`);
      imageUrl = await this.runFaceToMany(publicPhotoUrl, fullPrompt, styleObj.replicateStyle || 'Clay', styleObj.replicateModel!);
    } else if (styleObj.replicateModel?.includes('flux-pulid')) {
      this.logger.log(`Routing to FluxPuLID with model: ${styleObj.replicateModel}`);
      imageUrl = await this.runFluxPuLID(publicPhotoUrl, fullPrompt, styleObj.replicateModel!);
    } else {
      // Fallback to default PhotoMaker
      this.logger.log(`Fallback to PhotoMaker default style: ${styleObj.photoMakerStyleName || '(No style)'}`);
      imageUrl = await this.runPhotoMaker(publicPhotoUrl, fullPrompt, styleObj.photoMakerStyleName || '(No style)');
    }

    const filename = `${orderId}-page-${pageNumber}.png`;
    await this.downloadAndSave(imageUrl, filename);
    return `/api/uploads/${filename}`;
  }

  private async runFluxWatercolor(faceImageUrl: string, prompt: string): Promise<string> {
    return this.runImageToImage(faceImageUrl, prompt, "lucataco/flux-watercolor:ec079237c95a092c25390c50ca601b69f6fd7d5e4a83a152d192c7336e1cda6d");
  }

  private async runImageToImage(faceImageUrl: string, prompt: string, model: string): Promise<string> {
    this.logger.log(`Running Image-to-Image with model: ${model}`);
    const output = await this.replicate.run(model as `${string}/${string}:${string}`, {
      input: {
        image: faceImageUrl,
        prompt: prompt,
        prompt_strength: 0.7,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        output_format: "png",
      },
    });

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error(`Unexpected output format from model ${model}`);
  }

  private async resolvePublicUrl(url: string): Promise<string> {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (this.cachedFilePath === url && this.cachedFileUrl) {
      return this.cachedFileUrl;
    }

    const filePath = join(UPLOADS_DIR, url.replace(/^\/(?:api\/)?uploads\//, ''));
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

  private async runSceneOnly(faceImageUrl: string, prompt: string, styleName: string): Promise<string> {
    this.logger.log(`Running scene-only generation (no face embed): ${prompt.substring(0, 100)}...`);
    const output = await this.replicate.run(IMAGE_GEN_CONFIG.model as `${string}/${string}:${string}`, {
      input: {
        prompt,
        input_image: faceImageUrl,
        style_name: styleName,
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

  private async runPhotoMaker(faceImageUrl: string, prompt: string, styleName: string): Promise<string> {
    this.logger.log(`Running PhotoMaker with style "${styleName}": ${prompt.substring(0, 100)}...`);
    const output = await this.replicate.run(IMAGE_GEN_CONFIG.model as `${string}/${string}:${string}`, {
      input: {
        prompt,
        input_image: faceImageUrl,
        style_name: styleName,
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

  private async runFluxDev(prompt: string, model: string): Promise<string> {
    this.logger.log(`Running FLUX-Dev using model "${model}" with high guidance`);
    const output = await this.replicate.run(model as `${string}/${string}:${string}`, {
      input: {
        prompt: prompt,
        guidance: 5.0, // Increased guidance for stronger style adherence
        num_inference_steps: 30,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 90,
      },
    });

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from flux-dev');
  }

  private async runFaceToMany(faceImageUrl: string, prompt: string, style: string, model: string): Promise<string> {
    this.logger.log(`Running Face-to-Many using model "${model}" with style "${style}"`);
    const output = await this.replicate.run(model as `${string}/${string}:${string}`, {
      input: {
        image: faceImageUrl,
        prompt: prompt,
        style: style,
        instant_id_strength: 0.7,
        num_steps: 30,
        guidance_scale: 5,
        negative_prompt: NEGATIVE_PROMPT,
      },
    });

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from face-to-many');
  }

  private async runFluxPuLID(faceImageUrl: string, prompt: string, model: string): Promise<string> {
    this.logger.log(`Running Flux-PuLID using model "${model}"`);
    const output = await this.replicate.run(model as `${string}/${string}:${string}`, {
      input: {
        main_face_image: faceImageUrl,
        prompt: prompt,
        negative_prompt: NEGATIVE_PROMPT,
        num_steps: 20,
        start_step: 1,
        id_weight: 1.0,
        guidance_scale: 4,
        width: 1024,
        height: 1024,
        output_format: "png",
      },
    });

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from flux-pulid');
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
