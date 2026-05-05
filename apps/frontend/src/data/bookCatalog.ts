/**
 * Book catalog — the pre-made book templates available in the store.
 *
 * Each book's `slug` maps to a BOOK_TEMPLATES entry in @bookmagic/shared
 * and a static story builder in the backend.
 *
 * Pricing is NOT stored per-book — all pre-made books share the
 * `premadeStartingPrice` value configured by admin, sourced from the
 * PricingContext at render time.
 */

export interface CatalogBook {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;        // relative to /public
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
    category: 'Adventure',
    slug: 'cosmic-journey',
    gender: 'boy',
    ageRange: '4-8',
  },
  {
    id: 'girl-tooth-fairy',
    title: 'The Girl and the Tooth Fairy',
    subtitle: "A magical secret hidden among the stars",
    thumbnail: `${T}/the-girl-and-the-tooth-fairy.webp`,
    category: 'Fantasy',
    slug: 'tooth-fairy',
    gender: 'girl',
    ageRange: '3-7',
  },
];
