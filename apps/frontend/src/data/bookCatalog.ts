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
  | 'Sports'
  | 'Education';

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  'Adventure',
  'Fantasy',
  'Animals',
  'Sports',
  'Education',
];

const T = '/thumbnails'; // base path

export const BOOK_CATALOG: CatalogBook[] = [
  {
    id: 'boy-dragon-friend',
    title: 'The Boy and the Baby Dragon',
    subtitle: 'A baby dragon, an enchanted forest, and a brave new friendship',
    thumbnail: `${T}/the-boy-and-the-dragon-friend.jpg`,
    category: 'Fantasy',
    slug: 'dragon-friend',
    gender: 'boy',
    ageRange: '4-8',
  },
  {
    id: 'girl-tooth-fairy',
    title: 'The Girl and the Tooth Fairy',
    subtitle: "A magical secret hidden among the stars",
    thumbnail: `${T}/the-girl-and-the-tooth-fairy.jpg`,
    category: 'Fantasy',
    slug: 'tooth-fairy',
    gender: 'girl',
    ageRange: '3-7',
  },
  {
    id: 'counting-adventure',
    title: 'The Counting Adventure',
    subtitle: 'Count 1 to 10 through a magical day outdoors',
    thumbnail: `${T}/the-counting-adventure.jpg`,
    category: 'Education',
    slug: 'counting-fun',
    gender: 'neutral',
    ageRange: '3-6',
  },
  {
    id: 'alphabet-adventure',
    title: 'The Alphabet Adventure',
    subtitle: 'A to Z through a forest of friendly animals',
    thumbnail: `${T}/the-alphabet-adventure.jpg`,
    category: 'Education',
    slug: 'alphabets',
    gender: 'neutral',
    ageRange: '3-6',
  },
  {
    id: 'space-explorer',
    title: 'The Space Explorer',
    subtitle: 'Blast off through every planet of the solar system',
    thumbnail: `${T}/space-cover.jpg`,
    category: 'Adventure',
    slug: 'space-mission',
    gender: 'neutral',
    ageRange: '4-8',
  },
  {
    id: 'zoo-day',
    title: 'A Day at the Zoo',
    subtitle: 'A cheerful tour past every favourite animal',
    thumbnail: `${T}/zoo-cover.jpg`,
    category: 'Animals',
    slug: 'zoo-visit',
    gender: 'neutral',
    ageRange: '3-7',
  },
  {
    id: 'spider-man',
    title: 'Spider-Hero for a Day',
    subtitle: 'Swing into a day of friendly-neighborhood adventures',
    thumbnail: `${T}/spider-man-cover.jpg`,
    category: 'Fantasy',
    slug: 'spider-man-day',
    gender: 'neutral',
    ageRange: '4-8',
  },
  {
    id: 'superman',
    title: 'Super-Hero for a Day',
    subtitle: 'Fly, lift, and save the day with super-strength',
    thumbnail: `${T}/superman-cover.jpg`,
    category: 'Fantasy',
    slug: 'superman-day',
    gender: 'neutral',
    ageRange: '4-8',
  },
  {
    id: 'batman',
    title: 'Bat-Hero for a Night',
    subtitle: 'Investigate, leap, and become the caped detective',
    thumbnail: `${T}/batman-cover.jpg`,
    category: 'Fantasy',
    slug: 'batman-day',
    gender: 'neutral',
    ageRange: '4-8',
  },
];
