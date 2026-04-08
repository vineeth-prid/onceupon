import { BOOK_TEMPLATES, CATEGORIES } from '@bookmagic/shared';
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string, bookTemplateId: string): string {
  const template = BOOK_TEMPLATES.find((t: any) => t.id === bookTemplateId);
  const category = template ? CATEGORIES.find((c: any) => c.id === template.categoryId) : null;

  const bookName = template?.name || bookTemplateId;
  const bookDesc = template?.description || '';
  const categoryName = category?.name || '';

  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write a "${bookName}" story for a ${childAge}-year-old ${childGender} named ${childName}.

BOOK CONTEXT:
- Book title concept: "${bookName}"
- Book description: "${bookDesc}"
- Category/Genre: ${categoryName}
- The story should perfectly fit the "${categoryName}" genre and the "${bookName}" concept
- Make the story age-appropriate for a ${childAge}-year-old

STORY STRUCTURE:
- Create exactly 16 pages with a rich, complete story arc
- Pages 1-2: Introduction — set the scene, introduce ${childName} and the world of the story
- Pages 3-5: ${childName} enters the adventure — ${pronoun} discovers something exciting related to "${bookName}"
- Pages 6-8: Rising action — ${childName} explores, meets characters, faces small challenges
- Pages 9-11: The heart of the story — a meaningful challenge or discovery that ties into the "${bookName}" theme
- Pages 12-14: The climax — the most exciting moment where ${childName} overcomes the main challenge
- Pages 15-16: Resolution — a warm ending with a lesson or memory, ${childName} reflects on the adventure
- Each page should have 2-3 sentences (simple words for the age group)
- Each page should feature a DIFFERENT scene/location for visual variety

CHARACTER CONSISTENCY (CRITICAL):
- ${childName} is a HUMAN child and must ALWAYS appear as a normal human child in every scene
- ${childName} must NEVER be merged with, transformed into, or fused with any animal or creature
- ${childName} must always have exactly two human arms, two human legs, and a normal human body
- Describe ${childName}'s outfit consistently on EVERY page (e.g. "wearing a bright orange t-shirt and brown shorts")
- ${childName}'s body must always be clearly separate from any animals or creatures in the scene
- Any animal characters should be cute and friendly (not scary), and are SEPARATE characters from ${childName}
- In the imagePrompt, always explicitly describe ${childName} as "a young human ${childGender} child" to prevent character confusion

For each page, provide:
- pageNumber (1-16)
- text: the story text for this page (2-3 sentences, age-appropriate)
- imagePrompt: a DETAILED scene description for image generation. IMPORTANT RULES:
  1. Describe the environment richly — settings, objects, lighting, colors, atmosphere
  2. If animals or creatures appear, name them specifically and describe them visually
  3. Refer to ${childName} as "the child" — ONLY ONE human character allowed
  4. NEVER include other human characters (no parents, adults, family members, friends, crowds)
  5. The environment and key story elements should take up MOST of the scene description
  Example: "A warm cozy kitchen filled with golden sunlight, colorful ingredient jars lining the shelves, flour floating in the air like snow, the child stands on a wooden stool stirring a glowing mixing bowl, a tiny magical fairy sits on the rim of the bowl sprinkling sparkly sugar"
- sceneDescription: a brief description of what's happening in the scene
- layout: the page layout type (see below)
- imageComposition: how to compose the image for the chosen layout (see below)
${LAYOUT_INSTRUCTIONS}

${LAYOUT_JSON_STRUCTURE}`;
}
