/**
 * Wraps a base story prompt with family-mode multi-character instructions.
 * This tells Gemini to include multiple named characters and output
 * `charactersInScene` metadata per page for the image pipeline.
 */

interface FamilyMemberInfo {
  role: string;
  name: string;
  age?: number | null;
  gender?: string | null;
}

export function wrapWithFamilyInstructions(
  basePrompt: string,
  familyMembers: FamilyMemberInfo[],
): string {
  const mainChild = familyMembers.find((m) => m.role === 'MAIN_CHILD');
  const otherMembers = familyMembers.filter((m) => m.role !== 'MAIN_CHILD');

  const characterList = familyMembers
    .map((m, i) => {
      const ageStr = m.age ? `, ${m.age} years old` : '';
      const genderStr = m.gender ? `, ${m.gender}` : '';
      const roleLabel = formatRoleWithGender(m.role, m.gender);
      const refTag = getReferenceTag(m.role, m.gender, m.name);
      return `${i + 1}. ${m.name} (${roleLabel}${ageStr}${genderStr}) — referred to as "${refTag}" in imagePrompt`;
    })
    .join('\n');

  // Build specific character depiction rules
  const characterRules = otherMembers.map((m) => {
    const refTag = getReferenceTag(m.role, m.gender, m.name);
    if (m.role === 'PARENT') {
      const genderLabel = m.gender === 'man' ? 'father/man' : m.gender === 'woman' ? 'mother/woman' : 'parent';
      const adultDesc = m.gender === 'man' ? 'a tall adult man with broad shoulders and masculine features'
        : m.gender === 'woman' ? 'a tall adult woman with feminine features'
        : 'a tall adult with mature features';
      return `- ${m.name} is a ${genderLabel} (age ${m.age || 30}). In imagePrompt, ALWAYS describe as "${adultDesc}". Reference tag: "${refTag}"`;
    }
    if (m.role === 'GRANDPARENT') {
      const genderLabel = m.gender === 'man' ? 'grandfather' : m.gender === 'woman' ? 'grandmother' : 'grandparent';
      return `- ${m.name} is a ${genderLabel} (age ${m.age || 65}). In imagePrompt, ALWAYS describe as "an elderly ${m.gender || 'person'} with aged features, gray/white hair". Reference tag: "${refTag}"`;
    }
    if (m.role === 'SIBLING') {
      return `- ${m.name} is a child sibling (age ${m.age || 5}). Similar size to the main child. Reference tag: "${refTag}"`;
    }
    return '';
  }).filter(Boolean).join('\n');

  // Build charactersInScene examples based on actual members
  const allRoles = familyMembers.map((m) => `"${m.role}"`).join(', ');

  // Build name usage instructions for story text
  const nameUsageRules = familyMembers.map((m) => {
    const refTag = getReferenceTag(m.role, m.gender, m.name);
    if (m.role === 'MAIN_CHILD') {
      return `- In STORY TEXT: use "${m.name}" (the child's actual name). In imagePrompt: use "${refTag}"`;
    }
    const relationLabel = formatRoleWithGender(m.role, m.gender);
    return `- In STORY TEXT: use "${m.name}" or "${relationLabel}" or "${m.name}'s ${relationLabel}" naturally. In imagePrompt: use "${refTag}"`;
  }).join('\n');

  const familyOverride = `

═══════════════════════════════════════════════════════════
FAMILY MODE — MULTI-CHARACTER STORY
═══════════════════════════════════════════════════════════

This story features ${familyMembers.length} characters (a family):
${characterList}

NAMING IN STORY TEXT (VERY IMPORTANT):
Use the ACTUAL NAMES of family members in the story text. Do NOT use generic labels like "the child", "the parent", or "the sibling" in story text. Use their real names to make the story personal and warm.
${nameUsageRules}
Example: Instead of "The child ran to the parent", write "${mainChild?.name || 'the child'} ran to ${otherMembers[0]?.name || 'Papa'}".

CRITICAL FAMILY MODE RULES:
1. The main character is ${mainChild?.name || 'the child'}, but other family members appear throughout the story.
2. Use EXACTLY these reference tags in imagePrompt (NOT in story text) for each character:
${familyMembers.map((m) => `   - ${m.name} → "${getReferenceTag(m.role, m.gender, m.name)}"`).join('\n')}
3. NOT every character needs to appear on every page — vary it naturally:
   - Some pages feature just ${mainChild?.name || 'the child'} alone (solo adventures, discoveries)
   - Some pages feature 2 characters together (bonding moments)
   - A few key pages can feature the whole family together
   - Aim for roughly 40% solo main child, 40% two characters, 20% full family
4. When multiple characters appear, describe their SPATIAL ARRANGEMENT clearly in imagePrompt:
   - Always place characters LEFT to RIGHT in this order: main child first, then others
   - Example: "the child on the left, the father on the right"
5. Each character should have moments that showcase their personality
6. Family interactions should feel warm and natural — use names, not generic labels

GENDER AND AGE DEPICTION (EXTREMELY IMPORTANT — READ CAREFULLY):
- Each character MUST be depicted with their CORRECT GENDER at all times
- A father/man MUST look like an ADULT MALE — tall, masculine build, short hair (unless specified otherwise), strong jawline
- A mother/woman MUST look like an ADULT FEMALE — tall, feminine build, longer hair, softer features
- Children MUST look like SMALL CHILDREN — short, round faces, child proportions
- NEVER swap genders — a man stays a man, a woman stays a woman, in EVERY scene
- Adults are MUCH TALLER than children — always show clear height difference
- In imagePrompt, ALWAYS explicitly state the gender: "a tall adult man" or "a tall adult woman" — NEVER just "a parent" or "an adult"

CHARACTER-SPECIFIC RULES:
${characterRules}

IMPORTANT — charactersInScene field:
For EVERY page, include a "charactersInScene" array listing which character roles appear.
Use EXACTLY these role enum values (not "FATHER"/"MOTHER" — always use "PARENT"):
- Solo page: ["MAIN_CHILD"]
- Child + one parent: ["MAIN_CHILD", "PARENT"]
- Child + both parents: ["MAIN_CHILD", "PARENT", "PARENT"]
- Child + sibling: ["MAIN_CHILD", "SIBLING"]
- Full family: [${allRoles}]
Valid values ONLY: "MAIN_CHILD", "SIBLING", "PARENT", "GRANDPARENT" — no other values allowed.
This metadata controls which faces get embedded in the generated image.

OVERRIDE: The "ONLY ONE human character" rule does NOT apply in family mode.
Multiple human family members ARE allowed. But keep it to ONLY the listed family members — no strangers, crowds, or extra people.
═══════════════════════════════════════════════════════════
`;

  // Insert family instructions before the layout instructions section
  const layoutMarker = 'LAYOUT TYPES';

  if (basePrompt.includes(layoutMarker)) {
    const insertPos = basePrompt.indexOf(layoutMarker);
    return basePrompt.slice(0, insertPos) + familyOverride + '\n' + basePrompt.slice(insertPos);
  }

  return basePrompt + familyOverride;
}

function formatRoleWithGender(role: string, gender?: string | null): string {
  switch (role) {
    case 'MAIN_CHILD': return 'main character, child';
    case 'SIBLING': return 'sibling, child';
    case 'PARENT':
      if (gender === 'man') return 'father';
      if (gender === 'woman') return 'mother';
      return 'parent';
    case 'GRANDPARENT':
      if (gender === 'man') return 'grandfather';
      if (gender === 'woman') return 'grandmother';
      return 'grandparent';
    default: return role.toLowerCase();
  }
}

/**
 * Generate a UNIQUE reference tag for each family member.
 * Critical: must be unique even when there are two parents.
 */
export function getReferenceTag(role: string, gender?: string | null, name?: string): string {
  switch (role) {
    case 'MAIN_CHILD': return 'the child';
    case 'SIBLING': return 'the sibling';
    case 'PARENT':
      if (gender === 'man') return 'the father';
      if (gender === 'woman') return 'the mother';
      return `the parent ${name || ''}`.trim();
    case 'GRANDPARENT':
      if (gender === 'man') return 'the grandfather';
      if (gender === 'woman') return 'the grandmother';
      return `the grandparent ${name || ''}`.trim();
    default: return `the ${role.toLowerCase()}`;
  }
}
