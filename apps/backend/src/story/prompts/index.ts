import { buildPrompt as bookTemplate } from './book-template';
import { buildPrompt as customPrompt } from './custom';
import { wrapWithFamilyInstructions } from './family-wrapper';

interface FamilyMemberInfo {
  role: string;
  name: string;
  age?: number | null;
  gender?: string | null;
}

type PromptBuilder = (childName: string, childAge: number, childGender: string) => string;

export function getPromptBuilder(
  themeId: string,
  customStoryPrompt?: string,
  familyMembers?: FamilyMemberInfo[],
): PromptBuilder {
  const isFamilyMode = familyMembers && familyMembers.length >= 2;

  return (childName, childAge, childGender) => {
    let basePrompt: string;

    if (customStoryPrompt) {
      basePrompt = customPrompt(childName, childAge, childGender, customStoryPrompt, isFamilyMode ? familyMembers : undefined);
    } else {
      basePrompt = bookTemplate(childName, childAge, childGender, themeId, isFamilyMode ? familyMembers : undefined);
    }

    // Wrap with family instructions if family members are provided
    if (isFamilyMode) {
      basePrompt = wrapWithFamilyInstructions(basePrompt, familyMembers);
    }

    return basePrompt;
  };
}
