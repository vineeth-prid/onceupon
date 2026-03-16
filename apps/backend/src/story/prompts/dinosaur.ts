import { STYLE_SUFFIX } from '@bookmagic/shared';
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write an exciting dinosaur adventure for a ${childAge}-year-old ${childGender} named ${childName}.

STORY STRUCTURE:
- Create exactly 16 pages
- ${childName} discovers a magical portal in ${possessive} backyard that leads to the land of dinosaurs
- ${pronoun} befriends a baby dinosaur and together they explore the prehistoric world
- They face a small challenge together (like helping the baby dino find its family)
- Include fun dinosaur facts appropriate for age ${childAge}
- Each page should have 2-3 sentences (simple words for the age group)
- The story ends with ${childName} returning home with a special dinosaur gift/memory

CHARACTER CONSISTENCY (CRITICAL):
- ${childName} is a HUMAN child and must ALWAYS appear as a normal human child in every scene
- ${childName} must NEVER be merged with, transformed into, or fused with any animal or creature
- ${childName} must always have exactly two human arms, two human legs, and a normal human body
- Describe ${childName}'s outfit consistently on EVERY page (e.g. "wearing a bright orange t-shirt and brown shorts")
- ${childName}'s body must always be clearly separate from any animals/dinosaurs in the scene
- The baby dinosaur should be cute and friendly (not scary), and is a SEPARATE character from ${childName}
- In the imagePrompt, always explicitly describe ${childName} as "a young human ${childGender} child" to prevent character confusion

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
