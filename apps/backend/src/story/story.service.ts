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

  async generateStory(
    childName: string,
    childAge: number,
    childGender: string,
    theme: string,
  ): Promise<StoryOutputInput> {
    const builder = getPromptBuilder(theme);
    const prompt = builder(childName, childAge, childGender);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        this.logger.log(`Generating story attempt ${attempt + 1} for theme: ${theme}`);

        const response = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        const parsed = JSON.parse(text);

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
      }
    }

    throw new Error(`Story generation failed after 3 attempts: ${lastError?.message}`);
  }
}
