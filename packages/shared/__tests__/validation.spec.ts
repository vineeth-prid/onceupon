import {
  createOrderSchema,
  storyOutputSchema,
  shippingAddressSchema,
  uploadPhotoSchema,
} from '../src/validation';

describe('createOrderSchema', () => {
  const validOrder = {
    childName: 'Aarav',
    childAge: 5,
    childGender: 'boy' as const,
    theme: 'tooth-fairy',
    photoUrl: 'https://example.com/photo.jpg',
  };

  it('should accept a valid CreateOrderDto', () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validOrder);
    }
  });

  it('should reject empty childName', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, childName: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Child name is required');
    }
  });

  it('should reject childName over 50 characters', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      childName: 'A'.repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it('should reject childAge below 1', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, childAge: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Age must be at least 1');
    }
  });

  it('should reject childAge above 12', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, childAge: 13 });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer childAge', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, childAge: 5.5 });
    expect(result.success).toBe(false);
  });

  it('should reject invalid gender', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      childGender: 'unknown',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Gender must be boy, girl, or other',
      );
    }
  });

  it('should reject invalid theme', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      theme: 'nonexistent-theme',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Theme must be one of: tooth-fairy, dinosaur, moon-princess',
      );
    }
  });

  it('should reject empty photoUrl', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      photoUrl: '',
    });
    expect(result.success).toBe(false);
  });

  it('should accept local path as photoUrl', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      photoUrl: '/uploads/abc-123.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const result = createOrderSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('storyOutputSchema', () => {
  const validPage = {
    pageNumber: 1,
    text: 'Once upon a time...',
    imagePrompt: 'A child standing in a magical forest',
    sceneDescription: 'Opening scene in enchanted forest',
    layout: 'full-bleed-text-bottom' as const,
  };

  const validStory = {
    title: 'The Magical Adventure',
    pages: Array.from({ length: 16 }, (_, i) => ({
      ...validPage,
      pageNumber: i + 1,
    })),
  };

  it('should accept valid 16-page story', () => {
    const result = storyOutputSchema.safeParse(validStory);
    expect(result.success).toBe(true);
  });

  it('should reject story with fewer than 16 pages', () => {
    const result = storyOutputSchema.safeParse({
      ...validStory,
      pages: validStory.pages.slice(0, 10),
    });
    expect(result.success).toBe(false);
  });

  it('should reject story with more than 16 pages', () => {
    const result = storyOutputSchema.safeParse({
      ...validStory,
      pages: [...validStory.pages, { ...validPage, pageNumber: 17 }],
    });
    expect(result.success).toBe(false);
  });

  it('should reject story with empty title', () => {
    const result = storyOutputSchema.safeParse({ ...validStory, title: '' });
    expect(result.success).toBe(false);
  });

  it('should reject page with empty text', () => {
    const pages = [...validStory.pages];
    pages[0] = { ...pages[0], text: '' };
    const result = storyOutputSchema.safeParse({ ...validStory, pages });
    expect(result.success).toBe(false);
  });
});

describe('shippingAddressSchema', () => {
  const validAddress = {
    name: 'John Doe',
    line1: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'IN',
    phone: '+919876543210',
  };

  it('should accept valid address', () => {
    const result = shippingAddressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('should accept address with optional line2', () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      line2: 'Apt 4B',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid country code length', () => {
    const result = shippingAddressSchema.safeParse({
      ...validAddress,
      country: 'IND',
    });
    expect(result.success).toBe(false);
  });
});

describe('uploadPhotoSchema', () => {
  it('should accept valid JPEG upload', () => {
    const result = uploadPhotoSchema.safeParse({
      file: 'blob',
      contentType: 'image/jpeg',
      sizeBytes: 1024 * 1024, // 1MB
    });
    expect(result.success).toBe(true);
  });

  it('should reject file over 10MB', () => {
    const result = uploadPhotoSchema.safeParse({
      file: 'blob',
      contentType: 'image/jpeg',
      sizeBytes: 11 * 1024 * 1024,
    });
    expect(result.success).toBe(false);
  });

  it('should reject unsupported content type', () => {
    const result = uploadPhotoSchema.safeParse({
      file: 'blob',
      contentType: 'image/gif',
      sizeBytes: 1024,
    });
    expect(result.success).toBe(false);
  });
});
