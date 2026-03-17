export const STYLE_SUFFIX =
  'children book illustration style, soft watercolor, warm lighting, friendly characters, vibrant colors, storybook art, high quality, detailed';

export const NEGATIVE_PROMPT =
  'multiple people, two people, crowd, group, adult, woman, man, couple, family photo, extra person, scary, dark, violent, blood, horror, realistic photo, photorealistic, blurry, low quality, deformed, ugly, bad anatomy, extra limbs, extra hands, extra arms, extra fingers, mutated hands, fused fingers, merged bodies, hybrid creature, fused characters, body horror, conjoined, disfigured, malformed limbs, missing fingers, too many fingers, cropped head, out of frame';

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
  {
    id: 'custom',
    name: 'Write Your Own Story',
    description: 'Tell us your story in your own words and we\'ll bring it to life',
    coverColor: '#FFE0B2',
  },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const TOTAL_PAGES = 5;

export const IMAGE_GEN_CONFIG = {
  model: 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769',
  styleName: 'Disney Charactor' as const,
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
