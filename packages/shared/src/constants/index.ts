export const STYLE_SUFFIX =
  'children book illustration style, soft watercolor, warm lighting, friendly characters, vibrant colors, storybook art, high quality, detailed';

export const NEGATIVE_PROMPT =
  'scary, dark, violent, blood, horror, realistic photo, photorealistic, blurry, low quality, deformed, ugly, bad anatomy, extra limbs';

export const THEMES = [
  {
    id: 'tooth-fairy',
    name: 'The Tooth Fairy Adventure',
    description: 'A magical journey with the Tooth Fairy',
    coverColor: '#E8D5F5',
  },
  {
    id: 'dinosaur',
    name: 'Dinosaur Discovery',
    description: 'An exciting adventure in the land of dinosaurs',
    coverColor: '#D5F5E3',
  },
  {
    id: 'moon-princess',
    name: 'The Moon Princess',
    description: 'A dreamy adventure to the moon and back',
    coverColor: '#D5E8F5',
  },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const TOTAL_PAGES = 16;

export const IMAGE_GEN_CONFIG = {
  model: 'bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b',
  idWeight: 0.9,
  startStep: 1,
  numSteps: 20,
  width: 1024,
  height: 1024,
  guidanceScale: 4,
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
  IMAGES_GENERATING: ['IMAGES_COMPLETE', 'FAILED'],
  IMAGES_COMPLETE: ['PDF_GENERATING', 'FAILED'],
  PDF_GENERATING: ['PREVIEW_READY', 'FAILED'],
  PREVIEW_READY: ['PAYMENT_PENDING'],
  PAYMENT_PENDING: ['PAID', 'FAILED'],
  PAID: ['PRINTING', 'FAILED'],
  PRINTING: ['SHIPPED', 'FAILED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  FAILED: ['CREATED'], // allow retry
};
