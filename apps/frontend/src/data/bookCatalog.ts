/**
 * Book catalog — the 9 pre-made book templates.
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
    id: 'portugals-new-legend',
    title: "The Portugal's New Legend",
    subtitle: 'For champions with red and green at heart',
    thumbnail: `${T}/the-portugals-new-legend.webp`,
    price: 3499,
    priceFormatted: '$34.99',
    category: 'Sports',
    slug: 'portugals-legend',
    gender: 'boy',
    ageRange: '4-8',
  },
  {
    id: 'girl-saves-arctic',
    title: 'Girl Saves the Arctic Kingdom',
    subtitle: 'An icy adventure powered by care and courage',
    thumbnail: `${T}/girl-saves-the-arctic-kingdom.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Adventure',
    slug: 'arctic-rescue',
    gender: 'girl',
    ageRange: '3-7',
  },
  {
    id: 'vroom-vroom-boy',
    title: 'Vroom Vroom, The Boy Wins the Race',
    subtitle: "A child's race to believe, try, and win",
    thumbnail: `${T}/vroom-vroom-the-boy-wins-the-race.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Adventure',
    slug: 'vroom-vroom-race',
    gender: 'boy',
    ageRange: '3-7',
  },
  {
    id: 'super-boy-dragon',
    title: 'Super Boy and the Dragon',
    subtitle: 'A fearless hero meets a fiery friend',
    thumbnail: `${T}/super-boy-and-the-dragon.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Fantasy',
    slug: 'super-dragon',
    gender: 'boy',
    ageRange: '4-8',
  },
  {
    id: 'girl-lost-fairy-wings',
    title: 'Girl and the Lost Fairy Wings',
    subtitle: 'A magical quest to restore the fairy realm',
    thumbnail: `${T}/girl-and-the-lost-fairy-wings.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Fantasy',
    slug: 'lost-fairy-wings',
    gender: 'girl',
    ageRange: '3-7',
  },
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
  {
    id: 'boy-explores-zoo',
    title: 'Boy Explores the Zoo',
    subtitle: 'A wild day meeting amazing animals',
    thumbnail: `${T}/boy-explores-the-zoo.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Animals',
    slug: 'zoo-adventure-boy',
    gender: 'boy',
    ageRange: '2-5',
  },
  {
    id: 'girl-explores-zoo',
    title: 'Girl Explores the Zoo',
    subtitle: 'A wild day meeting amazing animals',
    thumbnail: `${T}/girl-explores-the-zoo.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Animals',
    slug: 'zoo-adventure-girl',
    gender: 'girl',
    ageRange: '2-5',
  },
  {
    id: 'boy-talk-to-animals',
    title: 'The Boy Who Could Talk to Animals',
    subtitle: 'A gift that changes everything',
    thumbnail: `${T}/the-boy-who-could-talk-to-animals.webp`,
    price: 2499,
    priceFormatted: '$24.99',
    category: 'Animals',
    slug: 'talk-to-animals',
    gender: 'boy',
    ageRange: '3-7',
  },
];
