import { forwardRef } from 'react';
import { FONTS, COLORS, type LayoutPageProps } from './shared';

export const FullBleedTextTop = forwardRef<HTMLDivElement, LayoutPageProps>(
  ({ page }, ref) => (
    <div ref={ref} className="book-page" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: COLORS.cream }}>
      {page.imageUrl && (
        <img src={page.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 55%, rgba(255,255,255,0) 100%)',
        padding: '1rem 1.3rem 2.5rem',
      }}>
        <p style={{ fontFamily: FONTS.body, fontSize: '0.85rem', lineHeight: 1.7, color: COLORS.ink, margin: 0, textAlign: 'center' }}>
          {page.text}
        </p>
        <div style={{ width: 30, height: 1, background: COLORS.gold, margin: '0.6rem auto 0', opacity: 0.5 }} />
      </div>
      <div style={{ position: 'absolute', bottom: '0.25rem', right: '0.5rem', fontSize: '0.6rem', color: COLORS.inkFaint, fontFamily: FONTS.system }}>
        {page.pageNumber}
      </div>
    </div>
  )
);
