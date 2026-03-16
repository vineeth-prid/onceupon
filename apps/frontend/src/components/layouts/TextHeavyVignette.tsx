import { forwardRef } from 'react';
import { FONTS, COLORS, type LayoutPageProps } from './shared';

export const TextHeavyVignette = forwardRef<HTMLDivElement, LayoutPageProps>(
  ({ page }, ref) => (
    <div ref={ref} className="book-page" style={{
      width: '100%', height: '100%', background: COLORS.warmWhite,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
    }}>
      {page.imageUrl && (
        <div style={{
          width: 140, height: 140,
          borderRadius: '50%', overflow: 'hidden',
          border: `3px solid ${COLORS.goldLight}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          marginBottom: '1rem', flexShrink: 0,
        }}>
          <img src={page.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem', opacity: 0.4 }}>
        <div style={{ width: 20, height: 1, background: COLORS.gold }} />
        <span style={{ fontFamily: FONTS.accent, fontSize: '0.7rem', color: COLORS.gold }}>~</span>
        <div style={{ width: 20, height: 1, background: COLORS.gold }} />
      </div>
      <p style={{
        fontFamily: FONTS.body, fontSize: '0.8rem', lineHeight: 1.9, color: COLORS.ink,
        margin: 0, textAlign: 'center', maxWidth: '90%',
      }}>
        {page.text}
      </p>
      <div style={{ position: 'absolute', bottom: '0.25rem', right: '0.5rem', fontSize: '0.6rem', color: COLORS.inkFaint, fontFamily: FONTS.system }}>
        {page.pageNumber}
      </div>
    </div>
  )
);
