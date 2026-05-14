export const NEGATIVE_PROMPT =
  'multiple people, two people, two children, two kids, second child, another child, duplicate person, twin, siblings, crowd, group, adult, woman, man, couple, extra person, human face on animal, animal face on human, human face on dragon, dragon face on human, human head on dragon body, dragon head on human body, dragon-bodied child, human-bodied dragon, child as dragon, child becoming dragon, child transforming into dragon, child with dragon wings, child with dragon tail, child with dragon scales, child with horns, dragon-headed child, child morphed with dragon, human-animal hybrid, chimera, centaur, horns on child, tail on child, animal ears on child, scales on child, fur on child, snout on child, claws on child, wings on child, child merged with animal, child fused with dinosaur, animal body parts on human, scary, dark, violent, blood, horror, realistic photo, photorealistic, blurry, low quality, deformed, ugly, bad anatomy, extra limbs, extra hands, extra arms, extra fingers, mutated hands, fused fingers, merged bodies, fused characters, body horror, conjoined, disfigured, malformed limbs, missing fingers, too many fingers, cropped head, out of frame, gender swap, wrong gender, wrong eye color, wrong skin color, wrong hair color, inconsistent character, different child, different face';

// Negative prompt for multi-person scenes — allows multiple people but keeps quality/safety guards
export const MULTI_PERSON_NEGATIVE_PROMPT =
  'human face on animal, animal face on human, human-animal hybrid, chimera, centaur, horns on child, tail on child, animal ears on child, scales on child, fur on child, snout on child, claws on child, wings on child, child merged with animal, child fused with dinosaur, animal body parts on human, scary, dark, violent, blood, horror, realistic photo, photorealistic, blurry, low quality, deformed, ugly, bad anatomy, extra limbs, extra hands, extra arms, extra fingers, mutated hands, fused fingers, merged bodies, fused characters, body horror, conjoined, disfigured, malformed limbs, missing fingers, too many fingers, cropped head, out of frame, gender swap, wrong gender';

// ─── Categories ─────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'adventure', name: 'Adventure', icon: '\uD83C\uDFD4\uFE0F', description: 'Thrilling quests and explorations', color: '#FF7043' },
  { id: 'animals', name: 'Animals', icon: '\uD83D\uDC3E', description: 'Stories with adorable animal friends', color: '#66BB6A' },
  { id: 'education', name: 'Education', icon: '\uD83D\uDCDA', description: 'Learn while having fun', color: '#42A5F5' },
  { id: 'fantasy', name: 'Fantasy', icon: '\uD83E\uDDD9', description: 'Magical worlds and enchanted creatures', color: '#AB47BC' },
  { id: 'fiction', name: 'Fiction', icon: '\uD83D\uDCD6', description: 'Imaginative tales and storytelling', color: '#EC407A' },
  { id: 'nurture', name: 'Nurture', icon: '\uD83D\uDC9B', description: 'Warmth, kindness and growing up', color: '#FFA726' },
  { id: 'cook', name: 'Cook', icon: '\uD83D\uDC68\u200D\uD83C\uDF73', description: 'Delicious cooking adventures', color: '#EF5350' },
  { id: 'sports', name: 'Sports', icon: '\u26BD', description: 'Champions and competitive spirit', color: '#26A69A' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

// ─── Book Templates ─────────────────────────────────────────────────────────

export const BOOK_TEMPLATES = [
  // Adventure
  { id: 'pirate-quest', categoryId: 'adventure' as CategoryId, name: 'Pirate Quest', description: 'Sail the seven seas hunting for treasure' },
  { id: 'jungle-explorer', categoryId: 'adventure' as CategoryId, name: 'Jungle Explorer', description: 'A daring journey through the wild jungle' },
  { id: 'space-mission', categoryId: 'adventure' as CategoryId, name: 'Space Mission', description: 'Blast off to explore the galaxy' },
  // Animals
  { id: 'puppy-rescue', categoryId: 'animals' as CategoryId, name: 'Puppy Rescue', description: 'Help find and rescue a lost puppy' },
  { id: 'ocean-friends', categoryId: 'animals' as CategoryId, name: 'Ocean Friends', description: 'Meet magical creatures under the sea' },
  { id: 'safari-adventure', categoryId: 'animals' as CategoryId, name: 'Safari Adventure', description: 'Explore the African savanna with animal friends' },
  // Education
  { id: 'learning-to-walk', categoryId: 'education' as CategoryId, name: 'Learning to Walk', description: 'A story about taking first steps' },
  { id: 'first-words', categoryId: 'education' as CategoryId, name: 'First Words', description: 'Discover the magic of first words' },
  { id: 'alphabets', categoryId: 'education' as CategoryId, name: 'Alphabets', description: 'An A-to-Z letter adventure' },
  { id: 'counting-fun', categoryId: 'education' as CategoryId, name: 'Counting Fun', description: 'Learn numbers in a playful story' },
  // Fantasy
  { id: 'dragon-friend', categoryId: 'fantasy' as CategoryId, name: 'Dragon Friend', description: 'Befriend a baby dragon in an enchanted land' },
  { id: 'fairy-kingdom', categoryId: 'fantasy' as CategoryId, name: 'Fairy Kingdom', description: 'Visit a magical kingdom of fairies' },
  { id: 'wizard-school', categoryId: 'fantasy' as CategoryId, name: 'Wizard School', description: 'First day at a school for young wizards' },
  // Fiction
  { id: 'time-traveler', categoryId: 'fiction' as CategoryId, name: 'Time Traveler', description: 'Journey through different eras of history' },
  { id: 'tiny-giant', categoryId: 'fiction' as CategoryId, name: 'The Tiny Giant', description: 'A small child with the biggest imagination' },
  { id: 'dream-world', categoryId: 'fiction' as CategoryId, name: 'Dream World', description: 'Adventures inside a magical dream' },
  // Nurture
  { id: 'new-sibling', categoryId: 'nurture' as CategoryId, name: 'New Sibling', description: 'Welcoming a new baby brother or sister' },
  { id: 'first-day-school', categoryId: 'nurture' as CategoryId, name: 'First Day of School', description: 'Making friends on the first school day' },
  { id: 'kindness-garden', categoryId: 'nurture' as CategoryId, name: 'Kindness Garden', description: 'Growing a garden of kindness and sharing' },
  // Cook
  { id: 'baking-day', categoryId: 'cook' as CategoryId, name: 'Baking Day', description: 'Bake a magical cake with enchanted ingredients' },
  { id: 'pizza-adventure', categoryId: 'cook' as CategoryId, name: 'Pizza Adventure', description: 'Create the world\'s most amazing pizza' },
  { id: 'fruit-forest', categoryId: 'cook' as CategoryId, name: 'Fruit Forest', description: 'Pick magical fruits to make a special recipe' },
  // Pre-made books (static stories)
  { id: 'tooth-fairy', categoryId: 'fantasy' as CategoryId, name: 'The Girl and the Tooth Fairy', description: 'A magical encounter with a pixie in the night sky' },
  { id: 'zoo-visit', categoryId: 'animals' as CategoryId, name: 'A Day at the Zoo', description: 'A cheerful visit to meet zoo animal friends' },
  { id: 'spider-man-day', categoryId: 'fantasy' as CategoryId, name: 'Spider-Hero for a Day', description: 'Swing into a day of friendly-neighborhood adventures' },
  { id: 'superman-day', categoryId: 'fantasy' as CategoryId, name: 'Super-Hero for a Day', description: 'Fly, lift, and save the day with super-strength' },
  { id: 'batman-day', categoryId: 'fantasy' as CategoryId, name: 'Bat-Hero for a Night', description: 'Investigate, leap, and become the caped detective' },
  // Family mode test story
  { id: 'family-park-adventure', categoryId: 'nurture' as CategoryId, name: 'Family Park Adventure', description: 'A magical day at the park with the whole family' },
  // Custom story (user-provided prompt)
  { id: 'custom', categoryId: 'adventure' as CategoryId, name: 'Custom Story', description: 'Your own story idea' },
] as const;

export type BookTemplateId = (typeof BOOK_TEMPLATES)[number]['id'];

// ─── Illustration Styles ────────────────────────────────────────────────────

// Valid PhotoMaker style_name values:
// "(No style)", "Cinematic", "Disney Charactor", "Digital Art",
// "Photographic (Default)", "Fantasy art", "Neonpunk", "Enhance",
// "Comic book", "Lowpoly", "Line art"

export const ILLUSTRATION_STYLES = [
  {
    id: 'disney-character',
    name: 'Disney / Pixar',
    icon: '\u2728',
    photoMakerStyleName: 'Disney Charactor',
    promptSuffix: '3d CGI, Pixar style, detailed background, full scene illustration, vibrant colors',
    description: 'Classic Disney & Pixar 3D animation look',
  },
  {
    id: 'kontext-disney',
    name: 'Photoreal Kontext',
    icon: '\ud83d\udcf7',
    replicateModel: 'black-forest-labs/flux-kontext-pro',
    promptSuffix: 'photorealistic illustration, cinematic lighting, soft natural light, sharp focus, high detail, professional photography aesthetic, shallow depth of field',
    description: 'Photorealistic story scenes with your EXACT face pixel-swapped onto every page using InsightFace \u2014 guaranteed identical face across all images',
  },
] as const;

export type IllustrationStyleId = (typeof ILLUSTRATION_STYLES)[number]['id'];

// ─── Image Generation Config ────────────────────────────────────────────────

export const TOTAL_PAGES = 16;

export const IMAGE_GEN_CONFIG = {
  model: 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769',
  // Lower = stronger face identity preservation. 40 was bleeding scene colors
  // (e.g. emerald dragons → green eyes on the child). 30 holds the Disney
  // stylization while anchoring features (eye color, hair, skin) to the
  // reference photo on every page including dragon-heavy close-ups.
  styleStrengthRatio: 30,
  numSteps: 30,
  guidanceScale: 5,
  numOutputs: 1,
} as const;

export const MULTI_PERSON_IMAGE_GEN_CONFIG = {
  model: 'mattheum/flux-multi-pulid-controlnet:698d4bd4cecda02d32cdb226d1dc397aeaf9b5ec4abdcc388833435317e18f78',
  numSteps: 20,
  startStep: 0,
  guidanceScale: 4,
  idWeight: 1,
  width: 1024,
  height: 1024,
  numOutputs: 1,
  outputFormat: 'png',
} as const;

// Alias for family mode — same content as MULTI_PERSON_NEGATIVE_PROMPT
export const NEGATIVE_PROMPT_FAMILY = MULTI_PERSON_NEGATIVE_PROMPT;

// Easel Advanced Face Swap — used for swapping additional family member faces
// into PhotoMaker-generated scenes
export const EASEL_FACE_SWAP_MODEL = 'easel/advanced-face-swap' as const;

// InsightFace InSwapper-128 wrapper — pixel-precise, identity-preserving
// face swap (industry standard, what Roop / Reactor / FaceFusion all use under
// the hood). Used by the Photoreal Kontext theme to overlay the user's actual
// face pixels onto each generated scene. Unlike Easel's advanced-face-swap,
// this does not blend source+target features — it transplants the face.
export const INSIGHTFACE_SWAP_MODEL = 'cdingram/face-swap:d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111' as const;

// Illustration styles that support family mode (PhotoMaker-based only)
export const FAMILY_COMPATIBLE_STYLES = [
  'disney-character',
] as const;

// Family role types
export const FAMILY_ROLES = ['MAIN_CHILD', 'SIBLING', 'PARENT', 'GRANDPARENT'] as const;
export type FamilyRole = (typeof FAMILY_ROLES)[number];

export const BOOK_DIMENSIONS = {
  pageWidth: 8.75, // inches, with bleed
  pageHeight: 8.75,
  coverWidth: 17.33, // spine + front + back
  coverHeight: 8.75,
  bleed: 0.125,
  safeMargin: 0.5,
  dpi: 300,
} as const;

/** Valid status transitions for the order state machine */
export const STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  CREATED: ['STORY_GENERATING', 'FAILED'],
  STORY_GENERATING: ['STORY_COMPLETE', 'FAILED'],
  STORY_COMPLETE: ['IMAGES_GENERATING', 'FAILED'],
  IMAGES_GENERATING: ['IMAGES_COMPLETE', 'PREVIEW_READY', 'FAILED', 'PAID'],
  IMAGES_COMPLETE: ['PDF_GENERATING', 'PREVIEW_READY', 'ORDER_CONFIRMED', 'FAILED'],
  PDF_GENERATING: ['PREVIEW_READY', 'ORDER_CONFIRMED', 'FAILED', 'IMAGES_COMPLETE'],
  PREVIEW_READY: ['PAYMENT_PENDING', 'PAID', 'IMAGES_GENERATING'],
  PAYMENT_PENDING: ['PAID', 'FAILED', 'IMAGES_GENERATING'],
  PAID: ['IMAGES_GENERATING', 'IMAGES_COMPLETE', 'PDF_GENERATING', 'PREVIEW_READY', 'ORDER_CONFIRMED', 'PRINTING', 'FAILED'],
  ORDER_CONFIRMED: ['PRINTING', 'FAILED', 'SHIPPED', 'DELIVERED'],
  PRINTING: ['SHIPPED', 'FAILED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  FAILED: ['CREATED', 'STORY_GENERATING', 'IMAGES_GENERATING', 'PAID'], // allow retry from common states
};
