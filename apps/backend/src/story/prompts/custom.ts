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
  customStoryPrompt: string,
  familyMembers?: FamilyMemberInfo[],
): string {
  const pronoun = childGender === 'girl' ? 'she' : childGender === 'boy' ? 'he' : 'they';
  const isFamilyMode = familyMembers && familyMembers.length >= 2;

  // Build family context to blend into the user's story idea
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

    familyContext = `\n\nFAMILY MEMBERS IN THIS STORY: ${memberDescriptions}\nThe user's story idea should be adapted to include these family members naturally. Use their ACTUAL NAMES in the story text — make it personal and warm.`;
    humanCharacterRule = `  4. In imagePrompt, refer to ${childName} as "the child". Other family members use reference tags (handled by family wrapper).
  5. Only include the listed family members — no strangers, crowds, or extra people.`;
    nameUsageRule = `- Use the ACTUAL NAMES of all family members in the story text (e.g., "${childName}", "${familyMembers.find(m => m.role === 'PARENT')?.name || 'Papa'}")
- Do NOT use generic labels like "the parent" or "the child's father" in story text — use their real names`;
  } else {
    humanCharacterRule = `  4. Refer to ${childName} as "the child" — ONLY ONE human character allowed
  5. NEVER include other human characters (no parents, adults, family members, friends, crowds)
  6. Any other characters should be animals, magical creatures, or fantasy beings (NOT human)`;
    nameUsageRule = `- ${childName} should be the main character using "${pronoun}" pronouns`;
  }

  return `You are a children's book author AND illustrator/designer. A user has provided their own story idea in natural language. Your job is to transform it into a beautiful, age-appropriate ${childAge}-year-old children's storybook for a ${childGender} named ${childName}.

USER'S STORY IDEA:
"${customStoryPrompt}"${familyContext}

YOUR TASK:
- Transform this story idea into exactly 16 beautifully written storybook pages
- Adapt the language and complexity for a ${childAge}-year-old
- Keep the core events and spirit of the user's story but make it magical, fun, and child-friendly
- Expand the story with a proper arc: introduction (pages 1-3), rising action (pages 4-7), adventure/exploration (pages 8-11), climax (pages 12-14), resolution (pages 15-16)
- Add vivid, imaginative details that would make great illustrations
${nameUsageRule}
- Each page should have 2-3 sentences (simple words for the age group)
- Each page should feature a DIFFERENT scene/location for visual variety
- Give the book a creative, catchy title

CHARACTER CONSISTENCY (CRITICAL):
- ${childName} is the main character and should always be depicted as a regular child, distinct from any animals or creatures
- ${childName} should NOT be visually blended with or transformed into any non-human character
- Describe ${childName}'s outfit consistently on EVERY page (e.g. "wearing a colorful t-shirt and shorts")
- In the imagePrompt, refer to ${childName} as "the child" to maintain consistency

For each page, provide:
- pageNumber (1-16)
- text: the story text for this page (2-3 sentences, age-appropriate)
- imagePrompt: a VERY DETAILED scene description for image generation. CRITICAL RULES:
  1. START with the LOCATION/SETTING — describe the specific place with vivid visual details (architecture, vegetation, colors, lighting)
  2. If the user mentions a real-world location (e.g. Kerala, Paris, Tokyo), include SPECIFIC visual landmarks and characteristics of that place (e.g. Kerala = lush green coconut palms, red-tiled rooftops, backwater canals, tropical flowers)
  3. Describe ALL animals, creatures, or objects prominently — give them SPECIFIC visual details (color, size, breed, pose, expression). Animals MUST be described with at least 3 visual details each.
     Example: "a fluffy orange tabby cat with bright green eyes curled up on a windowsill" NOT just "a cat"
${humanCharacterRule}
  7. The LOCATION and KEY OBJECTS/ANIMALS from the user's story should take up at LEAST 70% of the imagePrompt
  8. Include specific lighting and atmosphere details (golden hour, misty morning, etc.)

  GOOD Example: "A colorful Kerala school building with red-tiled roof surrounded by tall coconut palms, lush tropical garden with hibiscus flowers, a fluffy orange tabby cat with bright green eyes sitting on the school steps, the child kneeling down to pet the cat, warm tropical sunlight filtering through palm leaves, vibrant green background"
  BAD Example: "The child at school with a cat" (TOO VAGUE — will produce generic background)
- sceneDescription: a brief description of what's happening in the scene
- layout: the page layout type (see below)
- imageComposition: how to compose the image for the chosen layout (see below)
${LAYOUT_INSTRUCTIONS}

${LAYOUT_JSON_STRUCTURE}`;
}
