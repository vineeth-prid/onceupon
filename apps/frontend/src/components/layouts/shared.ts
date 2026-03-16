export const FONTS = {
  heading: "'Playfair Display', 'Georgia', serif",
  body: "'Crimson Text', 'Georgia', 'Times New Roman', serif",
  accent: "'Dancing Script', cursive",
  system: "'Georgia', serif",
} as const;

export const COLORS = {
  cream: '#f5f0e8',
  warmWhite: '#faf8f3',
  parchment: '#f0e6d3',
  ink: '#2c2c2c',
  inkLight: '#5a5a5a',
  inkFaint: 'rgba(0,0,0,0.3)',
  gold: '#c9a96e',
  goldLight: '#e8d5a0',
} as const;

export interface LayoutPageProps {
  page: {
    pageNumber: number;
    text: string;
    imageUrl: string | null;
    layout?: string;
  };
  childName?: string;
  title?: string;
}

/** Extract first letter for drop cap, skipping quotes and punctuation */
export function getDropCap(text: string): { letter: string; rest: string } {
  const match = text.match(/^[\s"'\u201C\u201D\u2018\u2019"']*([A-Za-z])/);
  if (match) {
    const idx = text.indexOf(match[1]);
    return { letter: match[1].toUpperCase(), rest: text.slice(idx + 1) };
  }
  return { letter: text.charAt(0), rest: text.slice(1) };
}
