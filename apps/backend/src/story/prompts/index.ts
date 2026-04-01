import { buildPrompt as bookTemplate } from './book-template';

type PromptBuilder = (childName: string, childAge: number, childGender: string) => string;

export function getPromptBuilder(themeId: string, customStoryPrompt?: string): PromptBuilder {
  // All book templates use the universal builder
  return (childName, childAge, childGender) =>
    bookTemplate(childName, childAge, childGender, themeId);
}
