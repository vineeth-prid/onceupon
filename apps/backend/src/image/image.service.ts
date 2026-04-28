import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Replicate from 'replicate';
import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { NEGATIVE_PROMPT, NEGATIVE_PROMPT_FAMILY, MULTI_PERSON_NEGATIVE_PROMPT, IMAGE_GEN_CONFIG, MULTI_PERSON_IMAGE_GEN_CONFIG, EASEL_FACE_SWAP_MODEL, ILLUSTRATION_STYLES } from '@bookmagic/shared';

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
  private fileUrlCache = new Map<string, string>();

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
    this.logger.log(`Describing character from photo for ${childName} (age: ${childAge}, gender: ${childGender})`);

    const filePath = photoUrl.startsWith('/')
      ? join(UPLOADS_DIR, photoUrl.replace(/^\/(?:api\/)?uploads\//, ''))
      : photoUrl;
    const imageBytes = await readFile(filePath);
    const base64Image = imageBytes.toString('base64');

    // Determine if this is an adult or child based on age and gender word
    const isAdult = childAge >= 18 || ['man', 'woman', 'adult'].includes(childGender);
    const genderWord = childGender === 'boy' ? 'boy' : childGender === 'girl' ? 'girl'
      : childGender === 'man' ? 'man' : childGender === 'woman' ? 'woman'
      : childGender === 'adult' ? 'adult' : 'child';
    const personType = isAdult ? 'adult' : 'child';
    const personLabel = isAdult ? `${genderWord} (adult, age ${childAge})` : `${genderWord} child (age ${childAge})`;

    // Build age-appropriate body description guidance
    const bodyGuidance = isAdult
      ? `5. Body build: This is an ADULT (age ${childAge}). Describe their adult build — tall, average height, slim/medium/stocky. Adults are significantly TALLER and have mature facial features (defined jawline, adult proportions). Do NOT describe them as child-like.`
      : `5. Build: Describe the child's build — small, average for age ${childAge}. Children have round faces and smaller proportions.`;

    const outfitGuidance = isAdult
      ? `Then suggest a simple, memorable adult outfit:
- A specific colored shirt/blouse/top appropriate for an adult ${genderWord}
- Specific pants/jeans/skirt/dress
- The outfit should be age-appropriate for a ${childAge}-year-old ${genderWord}`
      : `Then suggest a simple, memorable outfit:
- A specific colored t-shirt/top
- Specific pants/shorts/skirt
- The outfit should be gender-appropriate for a ${genderWord}`;

    const exampleIdentity = isAdult
      ? `Example for a man: "short black hair, medium brown skin, strong jawline, brown eyes, tall adult man"
Example for a woman: "long dark brown hair, light brown skin, oval face, dark eyes, adult woman"`
      : `Example for a boy: "short dark brown hair, medium brown skin, big brown eyes, boy"
Example for a girl: "long black hair in pigtails, light brown skin, large dark eyes, girl"`;

    const exampleFull = isAdult
      ? `Example: "A tall adult ${genderWord} with short straight black hair, medium brown skin, defined jawline, brown eyes, wearing a navy blue polo shirt and khaki chinos."`
      : `Example: "A ${genderWord} with short straight dark brown hair, medium brown skin, round face with large dark brown eyes, thick eyebrows, small nose, wearing a bright orange t-shirt, khaki shorts, and white sneakers."`;

    const prompt = `You are analyzing a photo of a ${personLabel} for a children's storybook illustration project.
Describe this ${genderWord}'s visual appearance in precise detail for an illustrator.
This person is ${childName}, age ${childAge}, ${childGender}.

Provide a CONCISE but DETAILED visual description covering:
1. Hair: EXACT color, style, length, texture (e.g. "short straight dark brown hair" or "short cropped black hair"). Be VERY specific about length — "short" vs "medium" vs "long" matters a lot for consistency across pages.
2. Skin tone: Use EXACT descriptions like "medium brown skin", "dark brown skin", "tan olive skin", "warm caramel skin", "deep brown skin". NEVER use vague terms.
3. Face shape and features (e.g. "round face, big brown eyes, thick eyebrows, small nose")
4. Gender: This is a ${genderWord}. Make sure the description clearly matches a ${genderWord}.
${bodyGuidance}

${outfitGuidance}

Format your response as TWO lines separated by "---":

LINE 1 (IDENTITY TAG): A SHORT 10-15 word phrase with the most critical identity features: hair + skin + eyes + gender + age category.
${exampleIdentity}

LINE 2 (FULL DESCRIPTION): The complete description including outfit, up to 50 words. MUST mention the gender and whether adult or child.
${exampleFull}

CRITICAL RULES:
- SKIN TONE and HAIR are the most important — be extremely specific
- Always mention the EXACT hair length (short/medium/long) — this prevents hair changing between pages
- Always include the gender word "${genderWord}" in both lines
${isAdult ? `- This is an ADULT — NEVER describe them as a child, kid, or baby. Use words like "tall", "adult", "mature" to clearly distinguish from children.` : `- This is a CHILD — describe them with age-appropriate features for a ${childAge}-year-old.`}
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

    const isPhotoMaker = !style.replicateModel || style.replicateModel.includes('photomaker');
    const imgKeyword = isPhotoMaker ? 'img ' : '';
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


  /**
   * Generate a page image with multiple people using Flux Multi-PuLID ControlNet.
   * Each character gets their own face reference image and bounding box position.
   */
  async generateMultiPersonPageImage(
    faceImages: { role: string; photoUrl: string }[],
    imagePrompt: string,
    orderId: string,
    pageNumber: number,
    characters: { role: string; position: string }[],
    imageComposition?: string,
    illustrationStyle?: string,
  ): Promise<string> {
    const style = getStyleConfig(illustrationStyle);

    let fullPrompt = `${imagePrompt}, ${style.promptSuffix}`;
    if (imageComposition) {
      fullPrompt = `${fullPrompt}. Composition: ${imageComposition}`;
    }

    // Resolve all face image URLs to public Replicate URLs
    const resolvedFaces: { role: string; url: string }[] = [];
    for (const face of faceImages) {
      const publicUrl = await this.resolvePublicUrl(face.photoUrl);
      resolvedFaces.push({ role: face.role, url: publicUrl });
    }

    // Map character positions to bounding box coordinates (normalized 0-1 on 1024x1024)
    const positionMap: Record<string, { x: number; y: number; width: number; height: number }> = {
      'left':         { x: 0.05, y: 0.15, width: 0.25, height: 0.45 },
      'center-left':  { x: 0.20, y: 0.15, width: 0.25, height: 0.45 },
      'center':       { x: 0.375, y: 0.15, width: 0.25, height: 0.45 },
      'center-right': { x: 0.55, y: 0.15, width: 0.25, height: 0.45 },
      'right':        { x: 0.70, y: 0.15, width: 0.25, height: 0.45 },
    };

    // Build the face-to-position mapping based on characters array
    const faceSlots: { url: string; bbox: { x: number; y: number; width: number; height: number } }[] = [];
    for (const char of characters) {
      const face = resolvedFaces.find((f) => f.role === char.role);
      if (!face) continue;
      const bbox = positionMap[char.position] || positionMap['center'];
      faceSlots.push({ url: face.url, bbox });
    }

    this.logger.log(`Generating multi-person image for order ${orderId}, page ${pageNumber} with ${faceSlots.length} faces`);
    this.logger.log(`Prompt: ${fullPrompt.substring(0, 200)}...`);

    const imageUrl = await this.runFluxMultiPuLID(fullPrompt, faceSlots);
    const filename = `${orderId}-page-${pageNumber}.png`;
    await this.downloadAndSave(imageUrl, filename);
    return `/api/uploads/${filename}`;
  }

  /**
   * Describe multiple family members from their individual cropped photos.
   * Runs Gemini Vision in parallel for each member.
   * Uses member ID (not role) as key since roles can repeat (e.g., two PARENTs).
   */
  async describeMultipleCharacters(
    members: Array<{ id: string; role: string; name: string; age?: number | null; gender?: string | null; croppedPhotoUrl: string }>,
  ): Promise<Map<string, string>> {
    this.logger.log(`Describing ${members.length} family members`);

    const results = await Promise.all(
      members.map(async (member) => {
        const genderWord = this.getGenderWord(member.gender, member.role);
        const ageNum = member.age || 8;
        try {
          const description = await this.describeCharacter(
            member.croppedPhotoUrl,
            member.name,
            ageNum,
            genderWord,
          );
          return { id: member.id, description };
        } catch (error) {
          this.logger.warn(`Character description failed for ${member.name} (${member.role}): ${(error as Error).message}`);
          return { id: member.id, description: '' };
        }
      }),
    );

    // Key by member ID (unique), not role (can repeat)
    const descMap = new Map<string, string>();
    for (const r of results) {
      descMap.set(r.id, r.description);
    }
    return descMap;
  }

  private getGenderWord(gender?: string | null, role?: string): string {
    if (gender === 'boy') return 'boy';
    if (gender === 'girl') return 'girl';
    if (gender === 'man') return 'man';
    if (gender === 'woman') return 'woman';
    if (role === 'PARENT' || role === 'GRANDPARENT') return 'adult';
    return 'child';
  }

  /**
   * Get an explicit gender label for image prompts.
   * Uses strong, unambiguous terms so PhotoMaker/Easel generates the correct gender.
   */
  private getExplicitGenderLabel(gender?: string | null, role?: string): string {
    if (gender === 'man') return 'man';
    if (gender === 'woman') return 'woman';
    if (gender === 'boy') return 'boy';
    if (gender === 'girl') return 'girl';
    // Infer from role if no gender specified
    if (role === 'PARENT') return 'adult person';
    if (role === 'GRANDPARENT') return 'elderly person';
    if (role === 'SIBLING') return 'child';
    return 'person';
  }

  /**
   * Family mode: Generate a page image with multiple characters.
   *
   * Solo scenes (only MAIN_CHILD): Uses PhotoMaker — best quality for single identity.
   * Multi-person scenes: Uses Flux Multi-PuLID ControlNet — natively supports multiple
   * face identities with bounding boxes. PhotoMaker only embeds ONE face via the `img`
   * trigger and frequently fails to generate the expected number of characters.
   *
   * Fallback: If Flux Multi-PuLID fails, retries with PhotoMaker + Easel face swap.
   */
  async generateFamilyPageImage(
    primaryPhotoUrl: string,
    familyMembers: Array<{ role: string; gender?: string | null; name?: string; croppedPhotoUrl: string; characterDescription?: string | null }>,
    imagePrompt: string,
    charactersInScene: string[],
    orderId: string,
    pageNumber: number,
    imageComposition?: string,
    primaryCharacterDescription?: string,
    primaryGender?: string,
    layout?: string,
    illustrationStyle?: string,
  ): Promise<string> {
    const style = getStyleConfig(illustrationStyle);

    // Normalize charactersInScene — Gemini may output 'FATHER'/'MOTHER' instead of 'PARENT'
    const roleAliases: Record<string, string> = {
      FATHER: 'PARENT', MOTHER: 'PARENT', DAD: 'PARENT', MOM: 'PARENT',
      GRANDMOTHER: 'GRANDPARENT', GRANDFATHER: 'GRANDPARENT', GRANDMA: 'GRANDPARENT', GRANDPA: 'GRANDPARENT',
      BROTHER: 'SIBLING', SISTER: 'SIBLING', YOUNGER_BROTHER: 'SIBLING', YOUNGER_SISTER: 'SIBLING',
      CHILD: 'MAIN_CHILD', KID: 'MAIN_CHILD',
    };
    const normalizedScene = charactersInScene.map((r) => roleAliases[r] || r);

    // Determine which non-primary characters appear on this page
    const additionalMembers = familyMembers.filter(
      (m) => m.role !== 'MAIN_CHILD' && normalizedScene.includes(m.role),
    );

    // If only main child appears (solo scene), use the standard single-person pipeline
    if (additionalMembers.length === 0) {
      return this.generatePageImage(
        primaryPhotoUrl,
        imagePrompt,
        orderId,
        pageNumber,
        imageComposition,
        primaryCharacterDescription,
        primaryGender,
        layout,
        illustrationStyle,
      );
    }

    // ── Multi-person scene: NO-IDENTITY base + Easel face swap for ALL ──
    // Key insight: PhotoMaker's `img` trigger makes ALL characters share the input face,
    // overriding gender descriptions. Solution: generate WITHOUT face identity (just
    // Disney style via style_name param), then swap ALL faces via Easel.
    const genderTag = primaryGender === 'boy' ? 'boy' : primaryGender === 'girl' ? 'girl' : 'child';

    let scenePrompt = imagePrompt
      .replace(/\b(crowd|group of people|strangers)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Build ALL character descriptions (including main child) — no `img` trigger
    const mainChild = familyMembers.find((m) => m.role === 'MAIN_CHILD');
    const allSceneMembers = [mainChild, ...additionalMembers].filter(Boolean) as typeof familyMembers;

    const characterDescriptions = allSceneMembers
      .map((m) => {
        const genderLabel = this.getExplicitGenderLabel(m.gender, m.role);
        if (m.role === 'MAIN_CHILD') {
          return `a small ${genderTag} child`;
        }
        if (m.role === 'PARENT') {
          return genderLabel === 'man'
            ? 'a TALL ADULT MAN with short hair, broad shoulders, masculine jawline, strong masculine build, much taller than the child'
            : 'a TALL ADULT WOMAN with longer hair, feminine features, adult female build, much taller than the child';
        }
        if (m.role === 'GRANDPARENT') {
          return `an elderly ${genderLabel} with gray hair, aged features, tall`;
        }
        if (m.role === 'SIBLING') {
          return `a ${genderLabel} child sibling`;
        }
        return `a ${genderLabel}`;
      })
      .join(', ');

    const totalPeople = allSceneMembers.length;
    const hasMale = allSceneMembers.some((m) => m.gender === 'man');

    // Use Flux Schnell (text-only, no face identity) for the base scene.
    // PhotoMaker's `img` trigger word makes ALL characters share the input face,
    // overriding gender descriptions. Flux Schnell follows text prompts accurately
    // for gender/body type. Then Easel swaps all faces to match the real family.
    let fullPrompt = `A family scene with exactly ${totalPeople} people: ${characterDescriptions}. Scene: ${scenePrompt}`;
    if (hasMale) {
      fullPrompt += '. The adult man has a clearly MASCULINE appearance — short hair, broad shoulders, angular jaw, male body shape.';
    }
    fullPrompt += '. Show clear height difference — adults much taller than children.';

    if (imageComposition) {
      fullPrompt = `${fullPrompt}. Composition: ${imageComposition}`;
    }
    // Add Disney/Pixar style via prompt (no style_name param available on Flux)
    fullPrompt = `3D animated Disney Pixar style, vibrant colors, detailed background, ${fullPrompt}`;

    this.logger.log(`[Family] Generating ${totalPeople}-person scene via Flux Schnell for order ${orderId}, page ${pageNumber}`);
    this.logger.log(`[Family] Members: ${allSceneMembers.map(m => `${m.name}(${m.role}/${m.gender})`).join(', ')}`);
    this.logger.log(`[Family] Prompt: ${fullPrompt.substring(0, 250)}...`);

    // Stage 1: Flux Schnell generates scene with correct genders (no face identity)
    const baseImageUrl = await this.runFluxSchnell(fullPrompt);

    // Stage 2: Easel face swap for ALL characters (child + parents)
    // Swap all faces so everyone gets their real face
    this.logger.log(`[Family] Stage 2: Swapping ALL ${allSceneMembers.length} face(s) via Easel`);

    let currentImageUrl = baseImageUrl;

    // Prepare all face URLs
    const faceUrls: string[] = [];
    for (const m of allSceneMembers) {
      faceUrls.push(await this.resolvePublicUrl(m.croppedPhotoUrl));
    }

    try {
      if (faceUrls.length <= 2) {
        // 1-2 faces: single Easel call
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceUrls[0], faceUrls[1]);
      } else if (faceUrls.length === 3) {
        // 3 faces: two Easel calls (2 + 1)
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceUrls[0], faceUrls[1]);
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceUrls[2]);
      } else {
        // 4 faces: two Easel calls (2 + 2)
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceUrls[0], faceUrls[1]);
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceUrls[2], faceUrls[3]);
      }
    } catch (error) {
      this.logger.warn(`[Family] Easel face swap failed, using base image: ${(error as Error).message}`);
    }

    const filename = `${orderId}-page-${pageNumber}.png`;
    await this.downloadAndSave(currentImageUrl, filename);
    return `/api/uploads/${filename}`;
  }

  /**
   * Build face slots with bounding box positions for Flux Multi-PuLID.
   * Positions are arranged left-to-right with adults taller than children.
   */
  private async buildFamilyFaceSlots(
    members: Array<{ role: string; gender?: string | null; croppedPhotoUrl: string }>,
  ): Promise<{ url: string; bbox: { x: number; y: number; width: number; height: number } }[]> {
    const count = members.length;

    // Pre-defined layouts based on number of people
    // Coordinates are normalized 0-1 on 1024x1024 canvas
    const layouts: Record<number, Array<{ x: number; y: number; width: number; height: number }>> = {
      2: [
        // Left person, Right person
        { x: 0.08, y: 0.10, width: 0.35, height: 0.55 },
        { x: 0.57, y: 0.10, width: 0.35, height: 0.55 },
      ],
      3: [
        // Left, Center, Right — center is slightly forward (child often in center)
        { x: 0.03, y: 0.08, width: 0.28, height: 0.55 },
        { x: 0.36, y: 0.12, width: 0.28, height: 0.50 },
        { x: 0.69, y: 0.08, width: 0.28, height: 0.55 },
      ],
      4: [
        { x: 0.02, y: 0.10, width: 0.22, height: 0.50 },
        { x: 0.26, y: 0.12, width: 0.22, height: 0.48 },
        { x: 0.52, y: 0.12, width: 0.22, height: 0.48 },
        { x: 0.76, y: 0.10, width: 0.22, height: 0.50 },
      ],
    };

    // Adjust heights: adults get taller boxes, children get shorter+lower
    const bboxes = layouts[count] || layouts[3]!.slice(0, count);
    const adjustedBboxes = members.map((m, i) => {
      const base = bboxes[i] || bboxes[bboxes.length - 1];
      const isAdult = m.role === 'PARENT' || m.role === 'GRANDPARENT';
      if (isAdult) {
        // Adults: taller box, starts higher
        return { x: base.x, y: base.y - 0.03, width: base.width, height: base.height + 0.08 };
      }
      // Children: shorter box, starts lower
      return { x: base.x, y: base.y + 0.10, width: base.width, height: base.height - 0.08 };
    });

    const slots: { url: string; bbox: { x: number; y: number; width: number; height: number } }[] = [];
    for (let i = 0; i < members.length; i++) {
      const url = await this.resolvePublicUrl(members[i].croppedPhotoUrl);
      slots.push({ url, bbox: adjustedBboxes[i] });
    }

    return slots;
  }

  /**
   * Fallback: PhotoMaker + Easel face swap if Flux Multi-PuLID fails.
   */
  private async generateFamilyPageImageFallback(
    primaryPhotoUrl: string,
    additionalMembers: Array<{ role: string; gender?: string | null; name?: string; croppedPhotoUrl: string; characterDescription?: string | null }>,
    scenePrompt: string,
    orderId: string,
    pageNumber: number,
    imageComposition?: string,
    primaryCharacterDescription?: string,
    primaryGender?: string,
    style?: StyleConfig,
  ): Promise<string> {
    const effectiveStyle = style || getStyleConfig();
    const genderTag = primaryGender === 'boy' ? 'boy' : primaryGender === 'girl' ? 'girl' : 'child';

    let identityTag = '';
    let fullDescription = '';
    if (primaryCharacterDescription) {
      const parts = primaryCharacterDescription.split('---').map((s: string) => s.trim());
      if (parts.length >= 2) {
        identityTag = parts[0];
        fullDescription = parts[1];
      } else {
        identityTag = primaryCharacterDescription.substring(0, 80);
        fullDescription = primaryCharacterDescription;
      }
    }

    const additionalDescriptions = additionalMembers
      .map((m) => {
        const genderLabel = this.getExplicitGenderLabel(m.gender, m.role);
        if (!m.characterDescription) {
          if (m.role === 'PARENT') return `a tall adult ${genderLabel}`;
          if (m.role === 'GRANDPARENT') return `an elderly ${genderLabel}`;
          if (m.role === 'SIBLING') return `a ${genderLabel} child sibling`;
          return `a ${genderLabel}`;
        }
        const parts = m.characterDescription.split('---').map((s: string) => s.trim());
        const identityPart = parts.length >= 2 ? parts[0] : '';
        const descPart = parts.length >= 2 ? parts[1] : m.characterDescription;
        if (m.role === 'PARENT') return `a TALL ADULT ${genderLabel} with ${identityPart}, who is ${descPart}`;
        if (m.role === 'GRANDPARENT') return `an elderly ${genderLabel} with ${identityPart}, who is ${descPart}`;
        return `a ${genderLabel} with ${identityPart}, who is ${descPart}`;
      })
      .filter(Boolean)
      .join(', and ');

    const totalPeople = additionalMembers.length + 1;
    let fullPrompt = `A group of exactly ${totalPeople} people: a img ${genderTag} child${identityTag ? ` with ${identityTag}` : ''}, standing together with ${additionalDescriptions}. Scene: ${scenePrompt}${fullDescription ? `. The child has ${fullDescription}` : ''}`;

    if (imageComposition) fullPrompt = `${fullPrompt}. Composition: ${imageComposition}`;
    if (effectiveStyle.promptSuffix) fullPrompt = `${effectiveStyle.promptSuffix}, ${fullPrompt}`;

    const publicPhotoUrl = await this.resolvePublicUrl(primaryPhotoUrl);
    this.logger.log(`[Family Fallback] PhotoMaker + Easel for order ${orderId}, page ${pageNumber}`);

    const baseImageUrl = await this.runPhotoMakerFamily(publicPhotoUrl, fullPrompt, effectiveStyle.photoMakerStyleName || '(No style)');

    // Easel face swap for additional members
    let currentImageUrl = baseImageUrl;
    if (additionalMembers.length <= 2) {
      const faceAUrl = await this.resolvePublicUrl(additionalMembers[0].croppedPhotoUrl);
      const faceBUrl = additionalMembers.length === 2
        ? await this.resolvePublicUrl(additionalMembers[1].croppedPhotoUrl)
        : undefined;
      try {
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceAUrl, faceBUrl);
      } catch (error) {
        this.logger.warn(`[Family Fallback] Easel swap failed: ${(error as Error).message}`);
      }
    } else {
      try {
        const faceAUrl = await this.resolvePublicUrl(additionalMembers[0].croppedPhotoUrl);
        const faceBUrl = await this.resolvePublicUrl(additionalMembers[1].croppedPhotoUrl);
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceAUrl, faceBUrl);
        const faceCUrl = await this.resolvePublicUrl(additionalMembers[2].croppedPhotoUrl);
        currentImageUrl = await this.runEaselFaceSwap(currentImageUrl, faceCUrl);
      } catch (error) {
        this.logger.warn(`[Family Fallback] Chained Easel swap failed: ${(error as Error).message}`);
      }
    }

    const filename = `${orderId}-page-${pageNumber}.png`;
    await this.downloadAndSave(currentImageUrl, filename);
    return `/api/uploads/${filename}`;
  }

  /**
   * PhotoMaker call using family-mode negative prompt (allows multiple people).
   */
  private async runPhotoMakerFamily(faceImageUrl: string, prompt: string, styleName: string): Promise<string> {
    this.logger.log(`Running PhotoMaker (family mode) with style "${styleName}": ${prompt.substring(0, 100)}...`);
    const output = await this.replicate.run(IMAGE_GEN_CONFIG.model as `${string}/${string}:${string}`, {
      input: {
        prompt,
        input_image: faceImageUrl,
        style_name: styleName,
        style_strength_ratio: IMAGE_GEN_CONFIG.styleStrengthRatio,
        num_steps: IMAGE_GEN_CONFIG.numSteps,
        guidance_scale: IMAGE_GEN_CONFIG.guidanceScale,
        num_outputs: IMAGE_GEN_CONFIG.numOutputs,
        negative_prompt: NEGATIVE_PROMPT_FAMILY,
        disable_safety_checker: true,
      },
    });

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from PhotoMaker (family)');
  }

  /**
   * Easel Advanced Face Swap — swaps 1-2 faces into a target image.
   */
  private async runEaselFaceSwap(
    targetImageUrl: string,
    swapImageAUrl: string,
    swapImageBUrl?: string,
  ): Promise<string> {
    this.logger.log(`Running Easel face swap: ${swapImageBUrl ? '2 faces' : '1 face'}`);

    const input: Record<string, any> = {
      image: targetImageUrl,
      swap_image: swapImageAUrl,
    };
    if (swapImageBUrl) {
      input.swap_image_b = swapImageBUrl;
    }

    const output = await this.replicate.run(
      EASEL_FACE_SWAP_MODEL as `${string}/${string}`,
      { input },
    );

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from Easel face swap');
  }

  private async resolvePublicUrl(url: string): Promise<string> {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Check cache (supports multiple files for family mode)
    const cached = this.fileUrlCache.get(url);
    if (cached) {
      return cached;
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

    this.fileUrlCache.set(url, fileUrl);
    this.logger.log(`File uploaded to Replicate: ${fileUrl}`);
    return fileUrl;
  }

  /**
   * Flux Schnell — fast text-to-image model (no face identity).
   * Used for multi-person family scenes where correct gender depiction is critical.
   */
  private async runFluxSchnell(prompt: string): Promise<string> {
    this.logger.log(`Running Flux Schnell: ${prompt.substring(0, 100)}...`);
    const output = await this.replicate.run(
      'black-forest-labs/flux-schnell' as `${string}/${string}`,
      {
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: '1:1',
          output_format: 'png',
          go_fast: true,
        },
      },
    );

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from Flux Schnell');
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

  private async runFluxMultiPuLID(
    prompt: string,
    faceSlots: { url: string; bbox: { x: number; y: number; width: number; height: number } }[],
  ): Promise<string> {
    this.logger.log(`Running Flux Multi-PuLID with ${faceSlots.length} face(s)`);

    const idNames = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

    const input: Record<string, any> = {
      prompt,
      negative_prompt: MULTI_PERSON_NEGATIVE_PROMPT,
      width: MULTI_PERSON_IMAGE_GEN_CONFIG.width,
      height: MULTI_PERSON_IMAGE_GEN_CONFIG.height,
      num_steps: MULTI_PERSON_IMAGE_GEN_CONFIG.numSteps,
      start_step: MULTI_PERSON_IMAGE_GEN_CONFIG.startStep,
      guidance_scale: MULTI_PERSON_IMAGE_GEN_CONFIG.guidanceScale,
      id_weight: MULTI_PERSON_IMAGE_GEN_CONFIG.idWeight,
      num_outputs: MULTI_PERSON_IMAGE_GEN_CONFIG.numOutputs,
      output_format: MULTI_PERSON_IMAGE_GEN_CONFIG.outputFormat,
      use_depth_controlnet: true,
    };

    for (let i = 0; i < faceSlots.length && i < idNames.length; i++) {
      const slot = faceSlots[i];
      const name = idNames[i];
      input[`id_${name}_image`] = slot.url;
      input[`bounding_box_${name}_x`] = slot.bbox.x;
      input[`bounding_box_${name}_y`] = slot.bbox.y;
      input[`bounding_box_${name}_width`] = slot.bbox.width;
      input[`bounding_box_${name}_height`] = slot.bbox.height;
    }

    const output = await this.replicate.run(
      MULTI_PERSON_IMAGE_GEN_CONFIG.model as `${string}/${string}:${string}`,
      { input },
    );

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return String(output[0]);
    throw new Error('Unexpected output format from flux-multi-pulid');
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
