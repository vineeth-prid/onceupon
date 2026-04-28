import { z } from 'zod';
import { TOTAL_PAGES, BOOK_TEMPLATES, ILLUSTRATION_STYLES, FAMILY_ROLES } from '../constants';

const bookTemplateIds = BOOK_TEMPLATES.map((t) => t.id) as [string, ...string[]];
const illustrationStyleIds = ILLUSTRATION_STYLES.map((s) => s.id) as [string, ...string[]];
const familyRoles = FAMILY_ROLES as unknown as readonly [string, ...string[]];

export const createOrderSchema = z.object({
  childName: z
    .string()
    .min(1, 'Child name is required')
    .max(50, 'Child name must be 50 characters or less'),
  childAge: z
    .number()
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(12, 'Age must be 12 or less'),
  childGender: z.enum(['boy', 'girl', 'other'], {
    errorMap: () => ({ message: 'Gender must be boy, girl, or other' }),
  }),
  theme: z.enum(bookTemplateIds, {
    errorMap: () => ({ message: 'Please select a valid book template' }),
  }),
  illustrationStyle: z.enum(illustrationStyleIds, {
    errorMap: () => ({ message: 'Please select a valid illustration style' }),
  }).default('disney-character'),
  photoUrl: z.string().min(1, 'Photo URL is required'),
  email: z.string().email('Invalid email address').optional(),
  customStoryPrompt: z.string().max(2000, 'Story prompt must be under 2000 characters').optional(),
});

// ─── Family Mode Schemas ─────────────────────────────────────────────────────

export const familyMemberSchema = z.object({
  role: z.enum(familyRoles, {
    errorMap: () => ({ message: 'Invalid family role' }),
  }),
  name: z.string().min(1, 'Name is required').max(50),
  age: z.number().int().min(0).max(99).optional(),
  gender: z.string().optional(),
  croppedPhotoUrl: z.string().min(1, 'Cropped photo URL is required'),
  sortOrder: z.number().int().min(0).default(0),
});

export const createFamilyOrderSchema = createOrderSchema.extend({
  familyMode: z.literal(true),
  groupPhotoUrl: z.string().min(1, 'Group photo URL is required'),
  familyMembers: z
    .array(familyMemberSchema)
    .min(2, 'At least 2 family members required')
    .max(4, 'Maximum 4 family members'),
});

// ─── Story Page Schemas ──────────────────────────────────────────────────────

export const pageLayoutEnum = z.enum([
  'full-bleed-text-bottom',
  'full-bleed-text-top',
  'full-bleed-text-center',
  'image-left-text-right',
  'image-right-text-left',
  'dramatic-image-only',
  'text-heavy-vignette',
  'chapter-title',
]);

export type PageLayout = z.infer<typeof pageLayoutEnum>;

export const storyPageSchema = z.object({
  pageNumber: z.number().int().min(1).max(TOTAL_PAGES),
  text: z.string().min(1, 'Page text is required'),
  imagePrompt: z.string().min(1, 'Image prompt is required'),
  sceneDescription: z.string().min(1, 'Scene description is required'),
  layout: pageLayoutEnum,
  imageComposition: z.string().optional(),
  charactersInScene: z.array(z.enum(familyRoles)).optional(),
});

export const storyOutputSchema = z.object({
  title: z.string().min(1, 'Story title is required'),
  pages: z
    .array(storyPageSchema)
    .length(TOTAL_PAGES, `Story must have exactly ${TOTAL_PAGES} pages`),
});

export const shippingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(10, 'Postal code too long'),
  country: z.string().length(2, 'Country must be a 2-letter ISO code'),
  phone: z.string().min(5, 'Phone number is required'),
});

export const uploadPhotoSchema = z.object({
  file: z.any(),
  contentType: z.enum(
    ['image/jpeg', 'image/png', 'image/webp'],
    {
      errorMap: () => ({
        message: 'Only JPEG, PNG, and WebP images are allowed',
      }),
    },
  ),
  sizeBytes: z
    .number()
    .max(10 * 1024 * 1024, 'File size must be under 10MB'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateFamilyOrderInput = z.infer<typeof createFamilyOrderSchema>;
export type FamilyMemberInput = z.infer<typeof familyMemberSchema>;
export type StoryPageInput = z.infer<typeof storyPageSchema>;
export type StoryOutputInput = z.infer<typeof storyOutputSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
