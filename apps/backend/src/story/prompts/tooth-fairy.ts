import { STYLE_SUFFIX } from '@bookmagic/shared';
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write a magical tooth fairy adventure for a ${childAge}-year-old ${childGender} named ${childName}.

STORY STRUCTURE:
- Create exactly 5 pages
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
- pageNumber (1-5)
- text: the story text for this page (2-3 sentences, age-appropriate)
- imagePrompt: a DETAILED scene description for image generation. IMPORTANT RULES:
  1. ALWAYS include magical creatures and objects prominently — describe the Tooth Fairy as a TINY glowing pixie with butterfly wings (NOT a human), include sparkles, floating teeth, magical dust
  2. Describe the environment richly: cloud castles, rainbow bridges, starry skies, magical forests, cozy bedrooms
  3. Refer to ${childName} as "the child" — ONLY ONE human character allowed
  4. NEVER include other human characters (no parents, adults, family members, friends, crowds)
  5. The magical elements and environment should take up MOST of the scene description
  Example: "A magnificent cloud castle with sparkling crystal towers and rainbow bridges, a tiny glowing pixie Tooth Fairy with shimmering butterfly wings hovering near the child, magical golden sparkles swirling around floating baby teeth, soft moonlight illuminating everything"
- sceneDescription: a brief description of what's happening in the scene
- layout: the page layout type (see below)
- imageComposition: how to compose the image for the chosen layout (see below)
${LAYOUT_INSTRUCTIONS}

${LAYOUT_JSON_STRUCTURE}`;
}
