import { STYLE_SUFFIX } from '@bookmagic/shared';
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

export function buildPrompt(childName: string, childAge: number, childGender: string): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  return `You are a children's book author AND illustrator/designer. Write an exciting dinosaur adventure for a ${childAge}-year-old ${childGender} named ${childName}.

STORY STRUCTURE:
- Create exactly 16 pages with a rich, complete story arc
- Pages 1-2: ${childName} discovers a magical portal in ${possessive} backyard that leads to the land of dinosaurs
- Pages 3-5: ${pronoun} befriends a baby dinosaur and they begin exploring the prehistoric world together
- Pages 6-8: They discover different dinosaur habitats — a lush jungle, a volcanic valley, a crystal cave, a river delta
- Pages 9-11: They face a challenge together (like helping the baby dino find its family, or protecting eggs from a storm)
- Pages 12-14: The climax — a big exciting moment (a volcanic eruption, a T-Rex encounter, or a dinosaur stampede) that they overcome together
- Pages 15-16: The resolution — ${childName} says goodbye to ${possessive} dinosaur friend and returns home with a special gift/memory
- Include fun dinosaur facts appropriate for age ${childAge} throughout the story
- Each page should have 2-3 sentences (simple words for the age group)
- Each page should feature a DIFFERENT scene/location for visual variety

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
- imagePrompt: a DETAILED scene description for image generation. IMPORTANT RULES:
  1. ALWAYS include SPECIFIC dinosaurs prominently in the scene — name the species and describe them visually (e.g. "a small cute green baby Brachiosaurus with big eyes", "a massive red T-Rex roaring in the background")
  2. Describe the environment: jungle, volcano, river, cave, ferns, prehistoric plants, sky, lighting
  3. Refer to ${childName} as "the child" — ONLY ONE human character allowed
  4. NEVER include other human characters (no parents, adults, family members, friends, crowds)
  5. The dinosaurs and environment should take up MOST of the scene description
  Example: "A lush prehistoric jungle with towering ferns and an erupting volcano in the far distance, a cute small green baby Triceratops with stubby horns nuzzling the child who kneels beside it in a sun-dappled clearing, colorful pterodactyls soaring across the orange sunset sky"
- sceneDescription: a brief description of what's happening in the scene
- layout: the page layout type (see below)
- imageComposition: how to compose the image for the chosen layout (see below)
${LAYOUT_INSTRUCTIONS}

${LAYOUT_JSON_STRUCTURE}`;
}
