import {
  CATEGORIES,
  BOOK_TEMPLATES,
  ILLUSTRATION_STYLES,
  TOTAL_PAGES,
  STATUS_TRANSITIONS,
  NEGATIVE_PROMPT,
  IMAGE_GEN_CONFIG,
  BOOK_DIMENSIONS,
} from '../src/constants';
import { OrderStatus } from '../src/types';

describe('Categories', () => {
  it('should have 7 categories', () => {
    expect(CATEGORIES).toHaveLength(7);
  });

  it('each category should have id, name, description, icon, color', () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeDefined();
      expect(cat.name).toBeDefined();
      expect(cat.description).toBeDefined();
      expect(cat.icon).toBeDefined();
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('Book Templates', () => {
  it('should have at least 3 templates per category', () => {
    for (const cat of CATEGORIES) {
      const templates = BOOK_TEMPLATES.filter((t) => t.categoryId === cat.id);
      expect(templates.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each template should have id, categoryId, name, description', () => {
    for (const tpl of BOOK_TEMPLATES) {
      expect(tpl.id).toBeDefined();
      expect(tpl.categoryId).toBeDefined();
      expect(tpl.name).toBeDefined();
      expect(tpl.description).toBeDefined();
    }
  });
});

describe('Illustration Styles', () => {
  it('should have at least 5 styles', () => {
    expect(ILLUSTRATION_STYLES.length).toBeGreaterThanOrEqual(5);
  });

  it('each style should have required fields', () => {
    for (const style of ILLUSTRATION_STYLES) {
      expect(style.id).toBeDefined();
      expect(style.name).toBeDefined();
      expect(style.photoMakerStyleName).toBeDefined();
      expect(style.promptSuffix.length).toBeGreaterThan(0);
    }
  });
});

describe('Constants', () => {
  it('TOTAL_PAGES should be 16', () => {
    expect(TOTAL_PAGES).toBe(16);
  });

  it('NEGATIVE_PROMPT should be a non-empty string', () => {
    expect(NEGATIVE_PROMPT.length).toBeGreaterThan(0);
  });

  it('IMAGE_GEN_CONFIG should use photomaker-style', () => {
    expect(IMAGE_GEN_CONFIG.model).toContain('tencentarc/photomaker-style');
  });

  it('BOOK_DIMENSIONS should have correct page size with bleed', () => {
    expect(BOOK_DIMENSIONS.pageWidth).toBe(8.75);
    expect(BOOK_DIMENSIONS.pageHeight).toBe(8.75);
    expect(BOOK_DIMENSIONS.coverWidth).toBe(17.33);
    expect(BOOK_DIMENSIONS.dpi).toBe(300);
  });
});

describe('STATUS_TRANSITIONS', () => {
  it('should define transitions for every OrderStatus', () => {
    for (const status of Object.values(OrderStatus)) {
      expect(STATUS_TRANSITIONS[status]).toBeDefined();
    }
  });

  it('CREATED can transition to STORY_GENERATING or FAILED', () => {
    expect(STATUS_TRANSITIONS['CREATED']).toContain('STORY_GENERATING');
    expect(STATUS_TRANSITIONS['CREATED']).toContain('FAILED');
  });

  it('DELIVERED has no valid transitions', () => {
    expect(STATUS_TRANSITIONS['DELIVERED']).toHaveLength(0);
  });

  it('FAILED can transition back to CREATED (retry)', () => {
    expect(STATUS_TRANSITIONS['FAILED']).toContain('CREATED');
  });
});
