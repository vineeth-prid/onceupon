import { buildPrompt as toothFairy } from './tooth-fairy';
import { buildPrompt as dinosaur } from './dinosaur';
import { buildPrompt as moonPrincess } from './moon-princess';
import { buildPrompt as custom } from './custom';

type PromptBuilder = (childName: string, childAge: number, childGender: string) => string;

const builders: Record<string, PromptBuilder> = {
  'tooth-fairy': toothFairy,
  'dinosaur': dinosaur,
  'moon-princess': moonPrincess,
};

export function getPromptBuilder(themeId: string, customStoryPrompt?: string): PromptBuilder {
  if (themeId === 'custom') {
    if (!customStoryPrompt) {
      throw new Error('Custom story prompt is required for custom theme');
    }
    // Return a builder that curries the custom prompt into the 4-arg custom builder
    return (childName, childAge, childGender) =>
      custom(childName, childAge, childGender, customStoryPrompt);
  }

  const builder = builders[themeId];
  if (!builder) {
    throw new Error(`Unknown theme: ${themeId}`);
  }
  return builder;
}
