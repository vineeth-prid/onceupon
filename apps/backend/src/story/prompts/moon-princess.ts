
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write a dreamy moon adventure for a ${childAge}-year-old ${childGender} named ${childName}.

STORY STRUCTURE:
- Create exactly 16 pages with a rich, complete story arc
- Pages 1-2: One night, ${childName} sees a moonbeam shining through ${possessive} window and follows it outside
- Pages 3-5: ${pronoun} floats up through the starry sky to the moon, landing in a silver landscape, and meets the Moon Princess/Prince (a luminous spirit)
- Pages 6-8: Together they explore the Moon Kingdom — crystal caves, silver gardens, a glowing lake, a star nursery where baby stars are born
- Pages 9-11: They meet magical moon creatures (glowing moon rabbits, gentle star jellyfish, singing crystal birds) and help with a task (a lost star, a fading moonflower, a broken constellation)
- Pages 12-14: A magical climax — they dance among the stars, or restore light to a dark part of the moon, or help launch new stars into the sky
- Pages 15-16: ${childName} gently floats back to bed, with a special moon charm that glows softly, and falls asleep dreaming of the stars
- Include magical, dreamy imagery appropriate for age ${childAge}
- Each page should have 2-3 sentences (simple words for the age group)
- Each page should feature a DIFFERENT scene/location for visual variety

CHARACTER CONSISTENCY (CRITICAL):
- ${childName} is a HUMAN child and must ALWAYS appear as a normal human child in every scene
- ${childName} must NEVER be merged with, transformed into, or fused with any other character or creature
- ${childName} must always have exactly two human arms, two human legs, and a normal human body
- Describe ${childName}'s outfit consistently on EVERY page (e.g. "wearing a soft lavender nightgown/pajamas")
- In the imagePrompt, always explicitly describe ${childName} as "a young human ${childGender} child"
- The Moon Princess/Prince should be gentle and luminous and is a SEPARATE character from ${childName}

For each page, provide:
- pageNumber (1-16)
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
