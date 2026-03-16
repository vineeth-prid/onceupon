import { forwardRef } from 'react';
import { FONTS, COLORS, type LayoutPageProps } from './shared';

export const FullBleedTextCenter = forwardRef<HTMLDivElement, LayoutPageProps>(
  ({ page }, ref) => (
    <div ref={ref} className="book-page" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: COLORS.cream }}>
      {page.imageUrl && (
        <img src={page.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div style={{
          background: 'rgba(250, 248, 243, 0.88)',
          backdropFilter: 'blur(4px)',
          border: `1px solid rgba(201, 169, 110, 0.3)`,
          borderRadius: 10, padding: '1.2rem 1.5rem',
          maxWidth: '85%',
        }}>
          <p style={{ fontFamily: FONTS.body, fontSize: '0.85rem', lineHeight: 1.7, color: COLORS.ink, margin: 0, textAlign: 'center', fontStyle: 'italic' }}>
            {page.text}
          </p>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '0.25rem', right: '0.5rem', fontSize: '0.6rem', color: COLORS.inkFaint, fontFamily: FONTS.system }}>
        {page.pageNumber}
      </div>
    </div>
  )
);
