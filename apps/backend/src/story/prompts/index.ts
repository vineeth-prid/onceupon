import { buildPrompt as toothFairy } from './tooth-fairy';
import { buildPrompt as dinosaur } from './dinosaur';
import { buildPrompt as moonPrincess } from './moon-princess';

type PromptBuilder = (childName: string, childAge: number, childGender: string) => string;

const builders: Record<string, PromptBuilder> = {
  'tooth-fairy': toothFairy,
  'dinosaur': dinosaur,
  'moon-princess': moonPrincess,
};

export function getPromptBuilder(themeId: string): PromptBuilder {
  const builder = builders[themeId];
  if (!builder) {
    throw new Error(`Unknown theme: ${themeId}`);
  }
  return builder;
}
