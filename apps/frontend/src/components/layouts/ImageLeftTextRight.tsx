import { forwardRef } from 'react';
import { FONTS, COLORS, getDropCap, type LayoutPageProps } from './shared';

export const ImageLeftTextRight = forwardRef<HTMLDivElement, LayoutPageProps>(
  ({ page }, ref) => {
    const { letter, rest } = getDropCap(page.text);
    return (
      <div ref={ref} style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: COLORS.cream,
      }}>
        <div style={{ width: '100%', height: '55%', overflow: 'hidden', flexShrink: 0 }}>
          {page.imageUrl ? (
            <img src={page.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: COLORS.parchment }} />
          )}
        </div>
        <div style={{ width: '100%', height: 1, background: COLORS.goldLight, opacity: 0.4, flexShrink: 0 }} />
        <div style={{
          flex: 1, background: COLORS.cream, padding: '1rem 1.3rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <p style={{ fontFamily: FONTS.body, fontSize: '0.85rem', lineHeight: 1.7, color: COLORS.ink, margin: 0 }}>
            <span style={{ fontFamily: FONTS.heading, fontSize: '2rem', float: 'left', lineHeight: 0.85, marginRight: '0.2rem', marginTop: '0.15rem', color: COLORS.gold }}>
              {letter}
            </span>
            {rest}
          </p>
          <div style={{ position: 'absolute', bottom: '0.3rem', right: '0.5rem', fontSize: '0.6rem', color: COLORS.inkFaint, fontFamily: FONTS.system }}>
            {page.pageNumber}
          </div>
        </div>
      </div>
    );
  }
);
