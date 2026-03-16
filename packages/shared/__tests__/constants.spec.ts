import {
  THEMES,
  TOTAL_PAGES,
  STATUS_TRANSITIONS,
  STYLE_SUFFIX,
  NEGATIVE_PROMPT,
  IMAGE_GEN_CONFIG,
  BOOK_DIMENSIONS,
} from '../src/constants';
import { OrderStatus } from '../src/types';

describe('Constants', () => {
  it('should have 3 themes', () => {
    expect(THEMES).toHaveLength(3);
  });

  it('each theme should have id, name, description, coverColor', () => {
    for (const theme of THEMES) {
      expect(theme.id).toBeDefined();
      expect(theme.name).toBeDefined();
      expect(theme.description).toBeDefined();
      expect(theme.coverColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('TOTAL_PAGES should be 16', () => {
    expect(TOTAL_PAGES).toBe(16);
  });

  it('STYLE_SUFFIX should be a non-empty string', () => {
    expect(STYLE_SUFFIX.length).toBeGreaterThan(0);
  });

  it('NEGATIVE_PROMPT should be a non-empty string', () => {
    expect(NEGATIVE_PROMPT.length).toBeGreaterThan(0);
  });

  it('IMAGE_GEN_CONFIG should use flux-pulid', () => {
    expect(IMAGE_GEN_CONFIG.model).toContain('bytedance/flux-pulid');
    expect(IMAGE_GEN_CONFIG.idWeight).toBe(0.9);
    expect(IMAGE_GEN_CONFIG.startStep).toBe(1);
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
