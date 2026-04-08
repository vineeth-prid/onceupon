import { buildPrompt as bookTemplate } from './book-template';
import { buildPrompt as customPrompt } from './custom';

type PromptBuilder = (childName: string, childAge: number, childGender: string) => string;

export function getPromptBuilder(themeId: string, customStoryPrompt?: string): PromptBuilder {
  if (customStoryPrompt) {
    return (childName, childAge, childGender) =>
      customPrompt(childName, childAge, childGender, customStoryPrompt);
  }
  return (childName, childAge, childGender) =>
    bookTemplate(childName, childAge, childGender, themeId);
}
