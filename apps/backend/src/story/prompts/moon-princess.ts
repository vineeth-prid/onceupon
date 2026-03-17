import { STYLE_SUFFIX } from '@bookmagic/shared';
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write a dreamy moon adventure for a ${childAge}-year-old ${childGender} named ${childName}.

STORY STRUCTURE:
- Create exactly 5 pages
- One night, ${childName} sees a moonbeam shining through ${possessive} window and follows it
- ${pronoun} floats up to the moon where ${pronoun} meets the Moon Princess/Prince
- Together they explore the moon kingdom, meet star creatures, and dance among the stars
- Include magical, dreamy imagery appropriate for age ${childAge}
- Each page should have 2-3 sentences (simple words for the age group)
- The story ends with ${childName} gently floating back to bed, with a special moon charm

CHARACTER CONSISTENCY (CRITICAL):
- ${childName} is a HUMAN child and must ALWAYS appear as a normal human child in every scene
- ${childName} must NEVER be merged with, transformed into, or fused with any other character or creature
- ${childName} must always have exactly two human arms, two human legs, and a normal human body
- Describe ${childName}'s outfit consistently on EVERY page (e.g. "wearing a soft lavender nightgown/pajamas")
- In the imagePrompt, always explicitly describe ${childName} as "a young human ${childGender} child"
- The Moon Princess/Prince should be gentle and luminous and is a SEPARATE character from ${childName}

For each page, provide:
- pageNumber (1-5)
- text: the story text for this page (2-3 sentences, age-appropriate)
- imagePrompt: a DETAILED scene description for image generation. IMPORTANT RULES:
  1. ALWAYS include magical creatures and celestial objects prominently — cute star creatures, glowing moon rabbits, floating crystals, shooting stars, nebula clouds
  2. Describe the Moon Princess as a luminous ethereal glowing spirit/fairy (NOT a human woman)
  3. Describe the environment richly: moonscape, silver craters, crystal caves, starfields, Earth in the sky
  4. Refer to ${childName} as "the child" — ONLY ONE human character allowed
  5. NEVER include other human characters (no parents, adults, family members, friends, crowds)
  6. The magical elements and environment should take up MOST of the scene description
  Example: "A shimmering moonscape with silver craters and towering glowing crystal formations, cute round star creatures with tiny glowing eyes bouncing around, a luminous ethereal Moon spirit floating beside the child, Earth glowing blue in the starry sky above, shooting stars streaking across the purple nebula sky"
- sceneDescription: a brief description of what's happening in the scene
- layout: the page layout type (see below)
- imageComposition: how to compose the image for the chosen layout (see below)
${LAYOUT_INSTRUCTIONS}

${LAYOUT_JSON_STRUCTURE}`;
}
