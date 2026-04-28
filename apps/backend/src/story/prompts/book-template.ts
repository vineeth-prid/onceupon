import { BOOK_TEMPLATES, CATEGORIES } from '@bookmagic/shared';
import { LAYOUT_INSTRUCTIONS, LAYOUT_JSON_STRUCTURE } from './layout-instructions';

interface FamilyMemberInfo {
  role: string;
  name: string;
  age?: number | null;
  gender?: string | null;
}

export function buildPrompt(
  childName: string,
  childAge: number,
  childGender: string,
  bookTemplateId: string,
  familyMembers?: FamilyMemberInfo[],
): string {
  const template = BOOK_TEMPLATES.find((t: any) => t.id === bookTemplateId);
  const category = template ? CATEGORIES.find((c: any) => c.id === template.categoryId) : null;

  const bookName = template?.name || bookTemplateId;
  const bookDesc = template?.description || '';
  const categoryName = category?.name || '';

  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const possessive = childGender === 'girl' ? 'her' : childGender === 'boy' ? 'his' : 'their';

  const isFamilyMode = familyMembers && familyMembers.length >= 2;

  let familyContext = '';
  let humanCharacterRule: string;
  let nameUsageRule: string;

  if (isFamilyMode) {
    const memberDescriptions = familyMembers.map((m) => {
      const roleLabel = m.role === 'MAIN_CHILD' ? 'main child'
        : m.role === 'PARENT' ? (m.gender === 'man' ? 'father' : m.gender === 'woman' ? 'mother' : 'parent')
        : m.role === 'SIBLING' ? (m.gender === 'boy' ? 'younger brother' : m.gender === 'girl' ? 'younger sister' : 'sibling')
        : m.role === 'GRANDPARENT' ? (m.gender === 'man' ? 'grandfather' : m.gender === 'woman' ? 'grandmother' : 'grandparent')
        : m.role.toLowerCase();
      return `${m.name} (${roleLabel}, age ${m.age || '?'})`;
    }).join(', ');

    familyContext = `\n- Family members: ${memberDescriptions}\n- Use their ACTUAL NAMES in the story text — make it personal and warm`;
    humanCharacterRule = `  3. In imagePrompt, refer to ${childName} as "the child". Other family members use reference tags.
  4. Only include the listed family members — no strangers, crowds, or extra people.`;
    nameUsageRule = `- Use the ACTUAL NAMES of all family members in the story text
- Do NOT use generic labels like "the parent" in story text — use "${familyMembers.find(m => m.role === 'PARENT')?.name || 'their name'}"`;
  } else {
    humanCharacterRule = `  3. Refer to ${childName} as "the child" — ONLY ONE human character allowed
  4. NEVER include other human characters (no parents, adults, family members, friends, crowds)`;
    nameUsageRule = `- ${childName} should be the main character using "${pronoun}" pronouns`;
  }

  return `You are a children's book author AND illustrator/designer. Write a "${bookName}" story for a ${childAge}-year-old ${childGender} named ${childName}.

BOOK CONTEXT:
- Book title concept: "${bookName}"
- Book description: "${bookDesc}"
- Category/Genre: ${categoryName}
- The story should perfectly fit the "${categoryName}" genre and the "${bookName}" concept
- Make the story age-appropriate for a ${childAge}-year-old${familyContext}

STORY STRUCTURE:
- Create exactly 16 pages with a rich, complete story arc
- Pages 1-2: Introduction — set the scene, introduce ${childName} and the world of the story
- Pages 3-5: ${childName} enters the adventure — ${pronoun} discovers something exciting related to "${bookName}"
- Pages 6-8: Rising action — ${childName} explores, meets characters, faces small challenges
- Pages 9-11: The heart of the story — a meaningful challenge or discovery that ties into the "${bookName}" theme
- Pages 12-14: The climax — the most exciting moment where ${childName} overcomes the main challenge
- Pages 15-16: Resolution — a warm ending with a lesson or memory, ${childName} reflects on the adventure
${nameUsageRule}
- Each page should have 2-3 sentences (simple words for the age group)
- Each page should feature a DIFFERENT scene/location for visual variety

CHARACTER CONSISTENCY (CRITICAL):
- ${childName} is the main character and should always be depicted as a regular child, distinct from any animals or creatures
- ${childName} should NOT be visually blended with or transformed into any non-human character
- Any animal characters should be cute and friendly, and are SEPARATE characters from ${childName}
- Describe ${childName}'s outfit consistently on EVERY page (e.g. "wearing a bright orange t-shirt and brown shorts")
- In the imagePrompt, refer to ${childName} as "the child" to maintain consistency

For each page, provide:
- pageNumber (1-16)
- text: the story text for this page (2-3 sentences, age-appropriate)
- imagePrompt: a DETAILED scene description for image generation. IMPORTANT RULES:
  1. Describe the environment richly — settings, objects, lighting, colors, atmosphere
  2. If animals or creatures appear, name them specifically and describe them visually
${humanCharacterRule}
  5. The environment and key story elements should take up MOST of the scene description
  Example: "A warm cozy kitchen filled with golden sunlight, colorful ingredient jars lining the shelves, flour floating in the air like snow, the child stands on a wooden stool stirring a glowing mixing bowl, a tiny magical fairy sits on the rim of the bowl sprinkling sparkly sugar"
- sceneDescription: a brief description of what's happening in the scene
- layout: the page layout type (see below)
- imageComposition: how to compose the image for the chosen layout (see below)
${LAYOUT_INSTRUCTIONS}

${LAYOUT_JSON_STRUCTURE}`;
}
