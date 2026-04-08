import React, { useRef, useState, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';

// ─── Dummy storybook images (Picsum with seeds for consistency) ───

const IMAGES = {
  cover: 'https://picsum.photos/seed/storybook-starry/400/500',
  page1: 'https://picsum.photos/seed/enchanted-forest-path/400/280',
  page2: 'https://picsum.photos/seed/magical-river-dawn/400/280',
  page3: 'https://picsum.photos/seed/starlit-mountain/400/280',
  page4: 'https://picsum.photos/seed/golden-meadow-sun/400/280',
  back: 'https://picsum.photos/seed/storybook-galaxy/400/500',
};

const PAGE_W = 400;
const PAGE_H = 500;
const SPREAD_W = PAGE_W * 2;
const ANIM_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const ANIM_MS = 700;

// ─── Page wrapper (react-pageflip requires forwardRef) ───

interface PageProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ children, style }, ref) => (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#fff',
        ...style,
      }}
    >
      {children}
    </div>
  ),
);
Page.displayName = 'Page';

// ─── Cover page component ───

function CoverContent() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(160deg, #1a0e06 0%, #5c3010 40%, #d4aa6a 100%)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${IMAGES.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3,
      }} />
      <div style={{
        position: 'absolute',
        top: 12, left: 12, right: 12, bottom: 12,
        border: '1.5px solid rgba(212,168,67,0.35)',
        borderRadius: 3,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px 28px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ width: 24, height: 1, background: 'rgba(212,168,67,0.5)' }} />
          <span style={{ fontSize: 14, color: 'rgba(212,168,67,0.6)' }}>&#10022;</span>
          <span style={{ width: 24, height: 1, background: 'rgba(212,168,67,0.5)' }} />
        </div>
        <p
          className="font-body"
          style={{
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(212,168,67,0.6)',
            marginBottom: 24,
          }}
        >
          Once Upon a Time
        </p>
        <h3
          className="font-display"
          style={{
            fontSize: 32,
            color: '#fff',
            lineHeight: 1.15,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          A Sky Full
          <br />
          of Stars
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0' }}>
          <span style={{ width: 24, height: 1, background: 'rgba(212,168,67,0.5)' }} />
          <span style={{ fontSize: 14, color: 'rgba(212,168,67,0.6)' }}>&#10022;</span>
          <span style={{ width: 24, height: 1, background: 'rgba(212,168,67,0.5)' }} />
        </div>
        <p
          className="font-body"
          style={{
            fontSize: 10,
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
          }}
        >
          A Personalized Adventure
        </p>
      </div>
      <div style={{
        position: 'absolute',
        top: 0, right: 0, width: 6, height: '100%',
        background: 'linear-gradient(to left, rgba(0,0,0,0.15), transparent)',
      }} />
    </div>
  );
}

// ─── Story page component ───

function StoryContent({
  chapterNum,
  chapterTitle,
  text,
  imageUrl,
  accentColor,
}: {
  chapterNum: number;
  chapterTitle: string;
  text: string;
  imageUrl: string;
  accentColor: string;
}) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#faf8f3',
    }}>
      <div style={{
        flex: '0 0 55%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img
          src={imageUrl}
          alt={chapterTitle}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 40,
          background: 'linear-gradient(to top, #faf8f3, transparent)',
        }} />
      </div>
      <div style={{
        flex: 1,
        padding: '12px 24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <p className="font-body" style={{
            fontSize: 8,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: accentColor,
            marginBottom: 4,
          }}>
            Chapter {chapterNum}
          </p>
          <h4 className="font-display" style={{
            fontSize: 16,
            color: '#2c2c2c',
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            {chapterTitle}
          </h4>
          <p className="font-body" style={{
            fontSize: 11,
            color: '#5a5a5a',
            lineHeight: 1.65,
          }}>
            {text}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
          <span style={{ width: 16, height: 1, background: accentColor, opacity: 0.4 }} />
          <span className="font-body" style={{ fontSize: 9, color: accentColor, opacity: 0.6 }}>{chapterNum}</span>
          <span style={{ width: 16, height: 1, background: accentColor, opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Back cover component ───

function BackCoverContent() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(160deg, #0F1B3D 0%, #2C3E6B 50%, #1a2a50 100%)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${IMAGES.back})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.2,
      }} />
      <div style={{
        position: 'absolute',
        top: 12, left: 12, right: 12, bottom: 12,
        border: '1.5px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: 6, height: '100%',
        background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
      }} />
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 32,
        textAlign: 'center',
      }}>
        <p
          className="font-display"
          style={{ fontSize: 28, color: '#fff', marginBottom: 16 }}
        >
          The End
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ width: 24, height: 1, background: 'rgba(212,168,67,0.4)' }} />
          <span style={{ fontSize: 12, color: 'rgba(212,168,67,0.5)' }}>&#10022;</span>
          <span style={{ width: 24, height: 1, background: 'rgba(212,168,67,0.4)' }} />
        </div>
        <p
          className="font-body"
          style={{
            fontSize: 9,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Made with love
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───

export default function BookShowcase() {
  const bookRef = useRef<any>(null);
  const bookAreaRef = useRef<HTMLDivElement>(null);
  const isFlipping = useRef(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [useSpread, setUseSpread] = useState(window.innerWidth >= 860);
  const totalPages = 6;

  // Derive book visual phase from current page
  const bookPhase: 'closed-front' | 'open' | 'closed-back' = !useSpread
    ? 'open' // portrait mode — always "open" (no blank page issue)
    : currentPage === 0
    ? 'closed-front'
    : currentPage >= totalPages - 1
    ? 'closed-back'
    : 'open';

  // Dynamic shadow based on book phase
  const bookShadow =
    bookPhase === 'closed-front'
      ? '8px 10px 35px rgba(0,0,0,0.3), 2px 4px 10px rgba(0,0,0,0.15)'
      : bookPhase === 'closed-back'
      ? '-8px 10px 35px rgba(0,0,0,0.3), -2px 4px 10px rgba(0,0,0,0.15)'
      : '0 20px 60px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.08)';

  // Responsive: spread on desktop, portrait on mobile
  useEffect(() => {
    const handler = () => setUseSpread(window.innerWidth >= 860);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Scroll-to-flip when hovering over book area
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isHovering) return;

      const pageFlip = bookRef.current?.pageFlip();
      if (!pageFlip) return;

      const current = pageFlip.getCurrentPageIndex();
      const total = pageFlip.getPageCount();

      // At boundaries — let the page scroll naturally
      if (e.deltaY > 0 && current >= total - 1) return;
      if (e.deltaY < 0 && current === 0) return;

      e.preventDefault();
      if (isFlipping.current) return;
      if (Math.abs(e.deltaY) < 10) return;

      if (e.deltaY > 0) {
        pageFlip.flipNext();
      } else {
        pageFlip.flipPrev();
      }

      isFlipping.current = true;
      setTimeout(() => {
        isFlipping.current = false;
      }, 1000);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isHovering]);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  // ─── Viewport dimensions for opening/closing effect ───
  const viewportWidth = useSpread
    ? bookPhase === 'open'
      ? SPREAD_W
      : PAGE_W
    : PAGE_W;

  // When closed-front, shift book left so only cover (right half) is visible
  const bookShift = useSpread && bookPhase === 'closed-front' ? -PAGE_W : 0;

  return (
    <section style={{ padding: '80px 0 100px', background: '#FAFAFA' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
        <div className="flex items-center justify-center gap-3" style={{ marginBottom: 16 }}>
        </div>
        <h2
          className="font-display"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: '#000', lineHeight: 1.1, fontWeight: 400, marginBottom: 12 }}
        >
          Flip through a <em style={{ fontStyle: 'italic', color: '#6F6F6F' }}>sample</em> book
        </h2>
        <p className="font-body" style={{ fontSize: 15, color: '#6F6F6F', maxWidth: 440, margin: '0 auto' }}>
          Every book is a one-of-a-kind story. Here's a peek at what yours could look like.
        </p>
      </div>

      {/* Book area — scroll-to-flip on hover */}
      <div
        ref={bookAreaRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ padding: '0 24px' }}
      >
        {/* Centering wrapper */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          maxWidth: SPREAD_W + 60,
          margin: '0 auto',
        }}>
          {/* Animated viewport — clips the book to create open/close effect */}
          <div
            style={{
              width: viewportWidth,
              overflow: 'hidden',
              borderRadius: 4,
              boxShadow: bookShadow,
              transition: `width ${ANIM_MS}ms ${ANIM_EASE}, box-shadow ${ANIM_MS}ms ${ANIM_EASE}`,
              position: 'relative',
            }}
          >
            {/* Stacked page edge (visible when closed) */}
            {bookPhase === 'closed-front' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: 4, right: -3,
                  width: 6,
                  height: 'calc(100% - 8px)',
                  background: 'linear-gradient(to right, #e8e4dd, #d8d4cc, #e8e4dd)',
                  borderRadius: '0 2px 2px 0',
                  zIndex: 10,
                }} />
                <div style={{
                  position: 'absolute',
                  top: 8, right: -5,
                  width: 4,
                  height: 'calc(100% - 16px)',
                  background: 'linear-gradient(to right, #ddd8d0, #ccc8c0, #ddd8d0)',
                  borderRadius: '0 2px 2px 0',
                  zIndex: 9,
                }} />
              </>
            )}
            {bookPhase === 'closed-back' && (
              <>
                <div style={{
                  position: 'absolute',
                  top: 4, left: -3,
                  width: 6,
                  height: 'calc(100% - 8px)',
                  background: 'linear-gradient(to left, #e8e4dd, #d8d4cc, #e8e4dd)',
                  borderRadius: '2px 0 0 2px',
                  zIndex: 10,
                }} />
                <div style={{
                  position: 'absolute',
                  top: 8, left: -5,
                  width: 4,
                  height: 'calc(100% - 16px)',
                  background: 'linear-gradient(to left, #ddd8d0, #ccc8c0, #ddd8d0)',
                  borderRadius: '2px 0 0 2px',
                  zIndex: 9,
                }} />
              </>
            )}

            {/* Spine shadow (only when open) */}
            {bookPhase === 'open' && useSpread && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 20,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.08) 60%, transparent)',
                zIndex: 5,
                pointerEvents: 'none',
              }} />
            )}

            {/* Book container — shifts to show correct half when closed */}
            <div style={{
              width: useSpread ? SPREAD_W : PAGE_W,
              transform: `translateX(${bookShift}px)`,
              transition: `transform ${ANIM_MS}ms ${ANIM_EASE}`,
            }}>
              {/* @ts-ignore — react-pageflip typings */}
              <HTMLFlipBook
                key={useSpread ? 'spread' : 'portrait'}
                ref={bookRef}
                width={PAGE_W}
                height={PAGE_H}
                size="fixed"
                showCover={true}
                mobileScrollSupport={false}
                className=""
                style={{}}
                startPage={0}
                drawShadow={true}
                flippingTime={800}
                usePortrait={!useSpread}
                startZIndex={0}
                autoSize={false}
                maxShadowOpacity={0.5}
                minWidth={PAGE_W}
                maxWidth={PAGE_W}
                minHeight={PAGE_H}
                maxHeight={PAGE_H}
                showPageCorners={true}
                disableFlipByClick={false}
                useMouseEvents={true}
                swipeDistance={30}
                clickEventForward={true}
                onFlip={handleFlip}
              >
                {/* Cover */}
                <Page>
                  <CoverContent />
                </Page>

                {/* Story pages */}
                <Page>
                  <StoryContent
                    chapterNum={1}
                    chapterTitle="The Journey Begins"
                    text="Once upon a time, a brave little explorer set off on an adventure beyond the clouds, where the sky turned to gold and the wind carried whispers of magic..."
                    imageUrl={IMAGES.page1}
                    accentColor="#c9a96e"
                  />
                </Page>

                <Page>
                  <StoryContent
                    chapterNum={2}
                    chapterTitle="The Enchanted Forest"
                    text="Through enchanted forests and over sparkling rivers, the journey continued. Every leaf seemed to sing, and every stone held a secret waiting to be discovered..."
                    imageUrl={IMAGES.page2}
                    accentColor="#6b8f6b"
                  />
                </Page>

                <Page>
                  <StoryContent
                    chapterNum={3}
                    chapterTitle="Whispers of the Stars"
                    text="The stars whispered secrets only the bravest hearts could hear. High above the world, a constellation spelled out a name that meant courage..."
                    imageUrl={IMAGES.page3}
                    accentColor="#7B68AE"
                  />
                </Page>

                <Page>
                  <StoryContent
                    chapterNum={4}
                    chapterTitle="To Be Continued..."
                    text="And the adventure was only just beginning. For every child who dares to dream, there is a story waiting — a story where they are the hero..."
                    imageUrl={IMAGES.page4}
                    accentColor="#c9a96e"
                  />
                </Page>

                {/* Back cover */}
                <Page>
                  <BackCoverContent />
                </Page>
              </HTMLFlipBook>
            </div>
          </div>
        </div>
      </div>

      {/* Page indicator dots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              style={{
                width: currentPage === i ? 20 : 7,
                height: 7,
                borderRadius: 4,
                background: currentPage === i ? '#000' : '#ccc',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
        <p className="font-body" style={{
          fontSize: 13,
          color: '#999',
          margin: 0,
          transition: 'opacity 0.3s',
        }}>
          {isHovering ? 'Scroll to flip pages' : 'Hover over book & scroll to flip'}
        </p>
      </div>
    </section>
  );
}
