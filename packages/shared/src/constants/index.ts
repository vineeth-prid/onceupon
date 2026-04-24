export const NEGATIVE_PROMPT =
  'multiple people, two people, two children, two kids, second child, another child, duplicate person, twin, siblings, crowd, group, adult, woman, man, couple, extra person, human face on animal, animal face on human, human-animal hybrid, chimera, centaur, horns on child, tail on child, animal ears on child, scales on child, fur on child, snout on child, claws on child, wings on child, child merged with animal, child fused with dinosaur, animal body parts on human, scary, dark, violent, blood, horror, realistic photo, photorealistic, blurry, low quality, deformed, ugly, bad anatomy, extra limbs, extra hands, extra arms, extra fingers, mutated hands, fused fingers, merged bodies, fused characters, body horror, conjoined, disfigured, malformed limbs, missing fingers, too many fingers, cropped head, out of frame, gender swap, wrong gender';

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
  { id: 'portugals-legend', categoryId: 'sports' as CategoryId, name: "Portugal's New Legend", description: 'For champions with red and green at heart' },
  { id: 'arctic-rescue', categoryId: 'adventure' as CategoryId, name: 'Arctic Kingdom Rescue', description: 'An icy adventure powered by care and courage' },
  { id: 'vroom-vroom-race', categoryId: 'adventure' as CategoryId, name: 'Vroom Vroom Race', description: "A child's race to believe, try, and win" },
  { id: 'super-dragon', categoryId: 'fantasy' as CategoryId, name: 'Super Boy and the Dragon', description: 'A fearless hero meets a fiery friend' },
  { id: 'lost-fairy-wings', categoryId: 'fantasy' as CategoryId, name: 'Lost Fairy Wings', description: 'A magical quest to restore the fairy realm' },
  { id: 'cosmic-journey', categoryId: 'adventure' as CategoryId, name: 'Cosmic Journey', description: 'Blast off through stars and galaxies' },
  { id: 'zoo-adventure-boy', categoryId: 'animals' as CategoryId, name: 'Zoo Adventure (Boy)', description: 'A wild day meeting amazing animals' },
  { id: 'zoo-adventure-girl', categoryId: 'animals' as CategoryId, name: 'Zoo Adventure (Girl)', description: 'A wild day meeting amazing animals' },
  { id: 'talk-to-animals', categoryId: 'animals' as CategoryId, name: 'Talk to Animals', description: 'A gift that changes everything' },
  // Custom story (user-provided prompt)
  { id: 'custom', categoryId: 'adventure' as CategoryId, name: 'Custom Story', description: 'Your own story idea' },
] as const;

export type BookTemplateId = (typeof BOOK_TEMPLATES)[number]['id'];

export const ILLUSTRATION_STYLES = [
  {
    id: 'disney-character',
    name: 'Disney / Pixar',
    icon: '\u2728',
    replicateModel: 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769',
    photoMakerStyleName: 'Disney Charactor',
    promptSuffix: '3d CGI, Pixar style, detailed background, full scene illustration, vibrant colors',
    description: 'Classic Disney & Pixar 3D animation look',
  },
  {
    id: '3d-animation',
    name: '3D Animation',
    icon: '\uD83C\uDFAE',
    replicateModel: 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769',
    photoMakerStyleName: 'Digital Art',
    promptSuffix: '3D animated, bright saturated colors, smooth rendering, stylized proportions, Dreamworks style, high quality digital art',
    description: 'Modern 3D animated style',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: '\uD83C\uDFA8',
    replicateModel: 'lucataco/flux-watercolor',
    promptSuffix: 'in the style of TOK, watercolor painting, soft washes, gentle blending, delicate brushstrokes, children book illustration, warm tones',
    description: 'Soft and dreamy watercolor paintings',
  },
  {
    id: 'geometric',
    name: 'Geometric',
    icon: '\uD83D\uDD37',
    replicateModel: 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769',
    photoMakerStyleName: 'Lowpoly',
    promptSuffix: 'geometric art style, clean flat shapes, bold color blocks, low-poly, modern minimalist illustration',
    description: 'Clean geometric shapes and bold colors',
  },
  {
    id: 'gouache',
    name: 'Gouache',
    icon: '\uD83D\uDD8C\uFE0F',
    replicateModel: 'bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b',
    promptSuffix: 'in the style of a thick opaque gouache painting, visible brushstrokes, vibrant colors, professional children\'s book illustration, matte finish, hand-painted texture',
    description: 'Rich opaque gouache style with deep textures and perfect face consistency',
  },
  {
    id: 'sticker-art',
    name: 'Sticker Art',
    icon: '\uD83C\uDFF7\uFE0F',
    replicateModel: 'cudanexus/stickergp:6ffeac3440d7f79fe412021e0a2d28b03a43062c090cc0c625d3a73f0aa1f827',
    promptSuffix: 'sticker art style, vector illustration, thick white border, glossy finish, die-cut sticker, flat colors, white background',
    description: 'Clean, glossy stickers with thick white borders',
  },
  {
    id: 'clay-animation',
    name: 'Clay Animation',
    icon: '\uD83E\uDDF8',
    replicateModel: 'bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b',
    promptSuffix: 'in the style of a handmade claymation figure, tactile polymer clay texture, stop-motion animation aesthetic, whimsical plasticine look, warm studio lighting, detailed handmade feel',
    description: 'Tactile stop-motion clay look with perfect identity preservation',
  },
  {
    id: 'picture-book',
    name: 'Picture Book',
    icon: '\uD83D\uDCD5',
    replicateModel: 'bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b',
    photoMakerStyleName: 'Line art',
    promptSuffix: 'classic children\'s book illustration, soft graphite pencil outlines, gentle watercolor washes, warm nostalgic atmosphere, storybook art on ivory paper, cozy and delicate',
    description: 'Traditional hand-drawn storybook art with perfect character consistency',
  },
] as const;

export type IllustrationStyleId = (typeof ILLUSTRATION_STYLES)[number]['id'];
export const TOTAL_PAGES = 16;
export const IMAGE_GEN_CONFIG = {
  model: 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769',
  styleStrengthRatio: 40,
  numSteps: 30,
  guidanceScale: 5,
  numOutputs: 1,
} as const;

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
  IMAGES_GENERATING: ['IMAGES_COMPLETE', 'PREVIEW_READY', 'FAILED'],
  IMAGES_COMPLETE: ['PDF_GENERATING', 'FAILED'],
  PDF_GENERATING: ['PREVIEW_READY', 'FAILED'],
  PREVIEW_READY: ['PAYMENT_PENDING', 'PAID'],
  PAYMENT_PENDING: ['PAID', 'FAILED'],
  PAID: ['IMAGES_GENERATING', 'PRINTING', 'FAILED'],
  PRINTING: ['SHIPPED', 'FAILED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  FAILED: ['CREATED'], // allow retry
};
