/**
 * Per-book preview assets (gallery on the book detail page).
 *
 * Convention:
 *   apps/frontend/public/books/{slug}/
 *     preview.mp4        (optional — omit the `video` field if not provided)
 *     video-thumb.webp   (poster/thumbnail for the video, required if video is set)
 *     image-1.{webp|png|jpg}
 *     image-2.{webp|png|jpg}
 *     ...
 *
 * To add a new book's gallery:
 *   1. Drop the files into `public/books/{slug}/`.
 *   2. Add an entry below keyed by the book's `slug` (matches BOOK_CATALOG.slug).
 *
 * Books without an entry fall back to showing just their cover thumbnail.
 */

export interface BookGalleryItem {
  type: 'video' | 'image';
  src: string;
  thumb: string;
}

export interface BookAssetSet {
  /** Optional preview video. Omit entirely if no video exists. */
  video?: { src: string; thumb: string };
  /** Ordered list of preview image paths. */
  images: string[];
}

export const BOOK_ASSETS: Record<string, BookAssetSet> = {
  'cosmic-journey': {
    video: {
      src: '/books/cosmic-journey/preview.mp4',
      thumb: '/books/cosmic-journey/video-thumb.webp',
    },
    images: [
      '/books/cosmic-journey/image-1.webp',
      '/books/cosmic-journey/image-2.webp',
      '/books/cosmic-journey/image-3.webp',
      '/books/cosmic-journey/image-4.webp',
      '/books/cosmic-journey/image-5.webp',
    ],
  },
  'tooth-fairy': {
    images: [
      '/books/tooth-fairy/image-1.png',
      '/books/tooth-fairy/image-2.png',
      '/books/tooth-fairy/image-3.png',
      '/books/tooth-fairy/image-4.png',
    ],
  },
};

/**
 * Build the gallery items for a book. Falls back to a single cover image
 * if no per-book assets are registered, so the page never crashes on a
 * book that hasn't had its assets uploaded yet.
 */
export function getBookGallery(slug: string, fallbackCover: string): BookGalleryItem[] {
  const assets = BOOK_ASSETS[slug];
  if (!assets) {
    return [{ type: 'image', src: fallbackCover, thumb: fallbackCover }];
  }
  const items: BookGalleryItem[] = [];
  if (assets.video) {
    items.push({ type: 'video', src: assets.video.src, thumb: assets.video.thumb });
  }
  for (const src of assets.images) {
    items.push({ type: 'image', src, thumb: src });
  }
  if (items.length === 0) {
    return [{ type: 'image', src: fallbackCover, thumb: fallbackCover }];
  }
  return items;
}
