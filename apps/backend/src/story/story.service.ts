import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { storyOutputSchema, StoryOutputInput, TOTAL_PAGES } from '@bookmagic/shared';
import { getPromptBuilder } from './prompts';

@Injectable()
export class StoryService {
  private readonly logger = new Logger(StoryService.name);
  private readonly client: GoogleGenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.config.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  /**
   * Generate a single preview page (title + 1 page) — saves Gemini tokens for preview
   */
  async generatePreviewPage(
    childName: string,
    childAge: number,
    childGender: string,
    theme: string,
    customStoryPrompt?: string,
    familyMembers?: Array<{ role: string; name: string; age?: number | null; gender?: string | null }>,
  ): Promise<{ title: string; pages: Array<{ pageNumber: number; text: string; imagePrompt: string; sceneDescription: string; layout: string; charactersInScene?: string[] }> }> {
    const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
    const storyContext = customStoryPrompt
      ? `Story idea: "${customStoryPrompt}"`
      : `Theme: "${theme}"`;

    const isFamilyMode = familyMembers && familyMembers.length >= 2;

    let familyInstructions = '';
    let characterFields = '';
    if (isFamilyMode) {
      const charList = familyMembers.map((m) => {
        const roleLabel = m.role === 'MAIN_CHILD' ? 'main child'
          : m.role === 'PARENT' ? (m.gender === 'man' ? 'father' : m.gender === 'woman' ? 'mother' : 'parent')
          : m.role === 'SIBLING' ? (m.gender === 'boy' ? 'younger brother' : m.gender === 'girl' ? 'younger sister' : 'sibling')
          : m.role === 'GRANDPARENT' ? (m.gender === 'man' ? 'grandfather' : m.gender === 'woman' ? 'grandmother' : 'grandparent')
          : m.role.toLowerCase();
        return `${m.name} (${roleLabel}, age ${m.age || '?'})`;
      }).join(', ');
      familyInstructions = `\nThis is a FAMILY story featuring: ${charList}.\nIMPORTANT: Use the ACTUAL NAMES of family members in the story text (e.g., "${familyMembers[0]?.name}", "${familyMembers[1]?.name}"). Do NOT use generic labels like "the parent" or "the sibling" in story text.\nInclude at least 2 family members in the preview scene. In imagePrompt, refer to the main child as "the child" and use reference tags for others ("the father", "the mother", etc.).\n`;
      characterFields = '\n  - "charactersInScene": array of roles appearing in the scene. Use EXACTLY these enum values: "MAIN_CHILD", "SIBLING", "PARENT", "GRANDPARENT". Do NOT use "FATHER"/"MOTHER" — always use "PARENT". Example: ["MAIN_CHILD", "PARENT", "PARENT"]';
    }

    const humanRule = isFamilyMode
      ? 'Only include the listed family members — no strangers or crowds.'
      : 'NO other human characters.';

    const prompt = `You are a children's book author. Create a SINGLE preview page for a personalized storybook.

Child: ${childName}, age ${childAge}, ${childGender} (${pronoun})
${storyContext}${familyInstructions}

Return JSON with:
- "title": a creative, catchy book title
- "pages": array with EXACTLY 1 page object containing:
  - "pageNumber": 1
  - "text": 2-3 sentences of the opening scene, age-appropriate for ${childAge}
  - "imagePrompt": a VERY detailed scene description for image generation. Describe the setting, lighting, atmosphere, and refer to ${childName} as "the child". ${humanRule}
  - "sceneDescription": brief description of what's happening
  - "layout": "full-bleed-text-bottom"${characterFields}

Return ONLY valid JSON, nothing else.`;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro'];
        const currentModel = modelsToTry[attempt % modelsToTry.length];
        this.logger.log(`Generating preview page attempt ${attempt + 1} for theme: ${theme} using ${currentModel}`);
        const response = await this.client.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json' },
        });

        if (response.promptFeedback?.blockReason) {
          throw new Error(`Prompt blocked by Gemini: ${response.promptFeedback.blockReason}`);
        }
        const text = response.text;
        if (!text) throw new Error('Empty response from Gemini');

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        if (!parsed.title || !parsed.pages?.[0]) throw new Error('Invalid preview response structure');

        // Ensure only 1 page
        parsed.pages = [parsed.pages[0]];
        parsed.pages[0].pageNumber = 1;
        parsed.pages[0].layout = parsed.pages[0].layout || 'full-bleed-text-bottom';

        this.logger.log(`Preview page generated: "${parsed.title}"`);
        return parsed;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Preview page attempt ${attempt + 1} failed: ${lastError.message}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    throw new Error(`Preview page generation failed after 5 attempts: ${lastError?.message}`);
  }

  async generateStory(
    childName: string,
    childAge: number,
    childGender: string,
    theme: string,
    customStoryPrompt?: string,
    familyMembers?: Array<{ role: string; name: string; age?: number | null; gender?: string | null }>,
  ): Promise<StoryOutputInput> {
    const builder = getPromptBuilder(theme, customStoryPrompt, familyMembers);
    const prompt = builder(childName, childAge, childGender);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro'];
        const currentModel = modelsToTry[attempt % modelsToTry.length];
        this.logger.log(`Generating story attempt ${attempt + 1} for theme: ${theme} using ${currentModel}`);

        const response = await this.client.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.promptFeedback?.blockReason) {
          throw new Error(`Prompt blocked by Gemini: ${response.promptFeedback.blockReason}`);
        }

        const text = response.text;
        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        // Pad or trim to TOTAL_PAGES if Gemini returns wrong count
        if (parsed.pages && parsed.pages.length > 0 && parsed.pages.length < TOTAL_PAGES) {
          this.logger.warn(`Gemini returned ${parsed.pages.length} pages, padding to ${TOTAL_PAGES}`);
          while (parsed.pages.length < TOTAL_PAGES) {
            const lastPage = parsed.pages[parsed.pages.length - 1];
            parsed.pages.push({
              pageNumber: parsed.pages.length + 1,
              text: lastPage.text,
              imagePrompt: lastPage.imagePrompt,
              sceneDescription: lastPage.sceneDescription,
              layout: lastPage.layout || 'full-bleed-text-bottom',
            });
          }
        } else if (parsed.pages && parsed.pages.length > TOTAL_PAGES) {
          this.logger.warn(`Gemini returned ${parsed.pages.length} pages, trimming to ${TOTAL_PAGES}`);
          parsed.pages = parsed.pages.slice(0, TOTAL_PAGES);
          // Re-number pages
          parsed.pages.forEach((p: any, i: number) => { p.pageNumber = i + 1; });
        }

        const validated = storyOutputSchema.parse(parsed);
        this.logger.log(`Story generated: "${validated.title}" with ${validated.pages.length} pages`);
        return validated;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Story generation attempt ${attempt + 1} failed: ${lastError.message}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    throw new Error(`Story generation failed after 5 attempts: ${lastError?.message}`);
  }
}
