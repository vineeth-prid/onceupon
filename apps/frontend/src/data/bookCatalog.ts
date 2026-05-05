/**
 * Book catalog — the pre-made book templates available in the store.
 *
 * Each book's `slug` maps to a BOOK_TEMPLATES entry in @bookmagic/shared
 * and a static story builder in the backend.
 */

export interface CatalogBook {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;        // relative to /public
  price: number;            // cents / paise
  priceFormatted: string;
  category: CatalogCategory;
  slug: string;             // maps to BOOK_TEMPLATES id → static story theme
  gender: 'boy' | 'girl' | 'neutral';
  ageRange: string;
}

export type CatalogCategory =
  | 'Adventure'
  | 'Fantasy'
  | 'Animals'
  | 'Sports';

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  'Adventure',
  'Fantasy',
  'Animals',
  'Sports',
];

const T = '/thumbnails'; // base path

export const BOOK_CATALOG: CatalogBook[] = [
  {
    id: 'boy-cosmic-journey',
    title: 'The Boy and the Cosmic Journey',
    subtitle: 'Blast off through stars and galaxies',
    thumbnail: `${T}/the-boy-and-the-cosmic-journey.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Adventure',
    slug: 'cosmic-journey',
    gender: 'boy',
    ageRange: '4-8',
  },
];
