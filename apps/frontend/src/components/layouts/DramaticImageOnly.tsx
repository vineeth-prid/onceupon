import { forwardRef } from 'react';
import { FONTS, type LayoutPageProps } from './shared';

export const DramaticImageOnly = forwardRef<HTMLDivElement, LayoutPageProps>(
  ({ page }, ref) => (
    <div ref={ref} className="book-page" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#1a1a1a' }}>
      {page.imageUrl && (
        <img src={page.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {page.text && (
        <div style={{
          position: 'absolute', bottom: '0.6rem', right: '0.8rem', left: '0.8rem',
          textAlign: 'right',
          fontSize: '0.55rem', color: 'rgba(255,255,255,0.45)',
          fontFamily: FONTS.accent, fontStyle: 'italic',
        }}>
          {page.text}
        </div>
      )}
    </div>
  )
);
