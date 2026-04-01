
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write a magical tooth fairy adventure for a ${childAge}-year-old ${childGender} named ${childName}.

STORY STRUCTURE:
- Create exactly 16 pages with a rich, complete story arc
- Pages 1-2: ${childName} discovers ${pronoun} has a wiggly tooth and it finally falls out at bedtime
- Pages 3-5: The Tooth Fairy appears — a tiny glowing pixie — and invites ${childName} on an adventure to the Tooth Fairy Kingdom
- Pages 6-8: They fly through starlit skies to the Cloud Castle, exploring magical rooms (a tooth museum, a wish workshop, a sparkle garden)
- Pages 9-11: ${childName} helps the Tooth Fairy with a special task (sorting magical teeth, fixing a broken rainbow bridge, calming a scared baby cloud creature)
- Pages 12-14: A magical celebration or ceremony where ${childName}'s tooth becomes something special (a wishing star, a crystal, a key)
- Pages 15-16: ${childName} flies back home, tucks into bed with a special gift, and falls asleep with a smile
- Include gentle humor and wonder appropriate for age ${childAge}
- Each page should have 2-3 sentences (simple words for the age group)
- Each page should feature a DIFFERENT scene/location for visual variety

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
