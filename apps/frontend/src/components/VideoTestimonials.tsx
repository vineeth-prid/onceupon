import { useRef, useState, useCallback } from 'react';

// Placeholder videos — families reading storybooks (replace with real testimonial videos)
const TESTIMONIALS = [
  {
    id: 1,
    video: 'https://picsum.photos/seed/family-read-1/400/560',
    poster: 'https://picsum.photos/seed/family-read-1/400/560',
    name: 'Sarah & Ayden',
    occasion: "Baby's First Year",
  },
  {
    id: 2,
    video: 'https://picsum.photos/seed/family-read-2/400/560',
    poster: 'https://picsum.photos/seed/family-read-2/400/560',
    name: 'Grace & Family',
    occasion: 'Princess Adventure',
  },
  {
    id: 3,
    video: 'https://picsum.photos/seed/family-read-3/400/560',
    poster: 'https://picsum.photos/seed/family-read-3/400/560',
    name: 'Jessica & Dad',
    occasion: 'Fairy Kingdom',
  },
  {
    id: 4,
    video: 'https://picsum.photos/seed/family-read-4/400/560',
    poster: 'https://picsum.photos/seed/family-read-4/400/560',
    name: 'Emma & Mom',
    occasion: 'Dragon Adventure',
  },
  {
    id: 5,
    video: 'https://picsum.photos/seed/family-read-5/400/560',
    poster: 'https://picsum.photos/seed/family-read-5/400/560',
    name: 'Oliver & Family',
    occasion: 'Space Explorer',
  },
  {
    id: 6,
    video: 'https://picsum.photos/seed/family-read-6/400/560',
    poster: 'https://picsum.photos/seed/family-read-6/400/560',
    name: 'Priya & Grandma',
    occasion: 'Growing Up',
  },
];

// Mute/unmute icon SVGs
function MuteIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#fff" />
        <line x1="23" y1="9" x2="17" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="17" y1="9" x2="23" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#fff" />
      <path d="M15.54 8.46a5 5 0 010 7.07" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.07 4.93a10 10 0 010 14.14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Arrow button
function NavArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className="flex items-center justify-center cursor-pointer"
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        flexShrink: 0,
        transition: 'all 0.2s',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
      >
        <path d="M9 5L16 12L9 19" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function VideoTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mutedCards, setMutedCards] = useState<Record<number, boolean>>(() => {
    const m: Record<number, boolean> = {};
    TESTIMONIALS.forEach((_, i) => { m[i] = true; });
    return m;
  });

  const cardWidth = 340;
  const gap = 16;

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = idx * (cardWidth + gap);
    el.scrollTo({ left: target, behavior: 'smooth' });
    setActiveIdx(idx);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIdx(Math.min(idx, TESTIMONIALS.length - 1));
  }, []);

  const toggleMute = (idx: number) => {
    setMutedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <section style={{ padding: '64px 0 56px', background: '#fff', overflow: 'hidden' }}>
      <style>{`
        .video-testi-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36, padding: '0 24px' }}>
        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 400,
            color: '#000',
            lineHeight: 1.15,
          }}
        >
          Reactions You Can Count On
        </h2>
      </div>

      {/* Scrollable video cards with nav arrows */}
      <div style={{ position: 'relative' }}>
        {/* Left arrow */}
        <div
          className="hidden md:flex"
          style={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
        >
          <NavArrow direction="left" onClick={() => scrollTo(Math.max(0, activeIdx - 1))} />
        </div>

        {/* Right arrow */}
        <div
          className="hidden md:flex"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
        >
          <NavArrow direction="right" onClick={() => scrollTo(Math.min(TESTIMONIALS.length - 1, activeIdx + 1))} />
        </div>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="video-testi-scroll"
          onScroll={handleScroll}
          style={{
            display: 'flex',
            gap,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            padding: '0 24px',
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              style={{
                flexShrink: 0,
                width: cardWidth,
                height: 480,
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                scrollSnapAlign: 'start',
                background: '#f0f0f0',
              }}
            >
              {/* Placeholder image (replace with <video> when real videos are available) */}
              <img
                src={t.poster}
                alt={`${t.name} reading their storybook`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="lazy"
              />

              {/* Bottom gradient overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
                background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                pointerEvents: 'none',
              }} />

              {/* Name & occasion overlay */}
              <div style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 56,
              }}>
                <p className="font-body" style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                  {t.name}
                </p>
                <p className="font-body" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {t.occasion}
                </p>
              </div>

              {/* Mute/unmute button */}
              <button
                onClick={() => toggleMute(i)}
                className="flex items-center justify-center cursor-pointer"
                aria-label={mutedCards[i] ? 'Unmute' : 'Mute'}
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <MuteIcon muted={mutedCards[i]} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="cursor-pointer"
            aria-label={`Go to testimonial ${i + 1}`}
            style={{
              width: activeIdx === i ? 20 : 8,
              height: 8,
              borderRadius: 4,
              background: activeIdx === i ? '#000' : '#d0d0d0',
              border: 'none',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </section>
  );
}
