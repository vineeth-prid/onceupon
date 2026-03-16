import { STYLE_SUFFIX } from '@bookmagic/shared';
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write a magical tooth fairy adventure for a ${childAge}-year-old ${childGender} named ${childName}.

STORY STRUCTURE:
- Create exactly 16 pages
- The story should be about ${childName} losing a tooth and meeting the Tooth Fairy
- ${childName} goes on a magical adventure with the Tooth Fairy to ${possessive} castle in the clouds
- Include gentle humor and wonder appropriate for age ${childAge}
- Each page should have 2-3 sentences of text (simple words for the age group)
- The story should have a happy, warm ending with ${childName} back in bed

CHARACTER CONSISTENCY (CRITICAL):
- ${childName} is a HUMAN child and must ALWAYS appear as a normal human child in every scene
- ${childName} must NEVER be merged with, transformed into, or fused with any other character
- ${childName} must always have exactly two human arms, two human legs, and a normal human body
- Describe ${childName}'s outfit consistently on EVERY page (e.g. "wearing cozy blue pajamas")
- In the imagePrompt, always explicitly describe ${childName} as "a young human ${childGender} child"
- The Tooth Fairy should be a friendly, sparkly character and is a SEPARATE character from ${childName}

For each page, provide:
- pageNumber (1-16)
- text: the story text for this page (2-3 sentences, age-appropriate)
- imagePrompt: a detailed image generation prompt that depicts the scene. Always include "${childName}" as the main character. End every imagePrompt with ", ${STYLE_SUFFIX}"
- sceneDescription: a brief description of what's happening in the scene
- layout: the page layout type (see below)
- imageComposition: how to compose the image for the chosen layout (see below)
${LAYOUT_INSTRUCTIONS}

${LAYOUT_JSON_STRUCTURE}`;
}
