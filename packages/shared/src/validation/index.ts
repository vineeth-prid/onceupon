import { z } from 'zod';

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
  theme: z.enum(['tooth-fairy', 'dinosaur', 'moon-princess'], {
    errorMap: () => ({ message: 'Theme must be one of: tooth-fairy, dinosaur, moon-princess' }),
  }),
  photoUrl: z.string().min(1, 'Photo URL is required'),
});

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
  pageNumber: z.number().int().min(1).max(16),
  text: z.string().min(1, 'Page text is required'),
  imagePrompt: z.string().min(1, 'Image prompt is required'),
  sceneDescription: z.string().min(1, 'Scene description is required'),
  layout: pageLayoutEnum,
  imageComposition: z.string().optional(),
});

export const storyOutputSchema = z.object({
  title: z.string().min(1, 'Story title is required'),
  pages: z
    .array(storyPageSchema)
    .length(16, 'Story must have exactly 16 pages'),
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
export type StoryPageInput = z.infer<typeof storyPageSchema>;
export type StoryOutputInput = z.infer<typeof storyOutputSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
