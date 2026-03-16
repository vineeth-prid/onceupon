import { forwardRef } from 'react';
import { FONTS, COLORS, type LayoutPageProps } from './shared';

export const ChapterTitle = forwardRef<HTMLDivElement, LayoutPageProps>(
  ({ page, childName, title }, ref) => (
    <div ref={ref} className="book-page" style={{
      width: '100%', height: '100%', background: COLORS.parchment,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', opacity: 0.5 }}>
        <div style={{ width: 30, height: 1, background: COLORS.gold }} />
        <span style={{ fontFamily: FONTS.accent, fontSize: '1rem', color: COLORS.gold }}>*</span>
        <div style={{ width: 30, height: 1, background: COLORS.gold }} />
      </div>
      <h2 style={{
        fontFamily: FONTS.heading, fontSize: '1.4rem', fontWeight: 700,
        color: COLORS.ink, textAlign: 'center', lineHeight: 1.3, margin: '0 0 1.2rem',
      }}>
        {title || page.text}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', opacity: 0.5 }}>
        <div style={{ width: 30, height: 1, background: COLORS.gold }} />
        <span style={{ fontFamily: FONTS.accent, fontSize: '1rem', color: COLORS.gold }}>*</span>
        <div style={{ width: 30, height: 1, background: COLORS.gold }} />
      </div>
      {childName && (
        <p style={{
          fontFamily: FONTS.accent, fontSize: '1rem', color: COLORS.inkLight, fontStyle: 'italic', margin: 0,
        }}>
          A story for {childName}
        </p>
      )}
    </div>
  )
);
