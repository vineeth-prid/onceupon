import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { getOrder, downloadPdf, createRazorpayOrder, verifyRazorpayPayment } from '../api/orders';

const RZP_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_8zpjzk5bLxS6K7';

const FONT_BODY = "'Crimson Text', 'Georgia', serif";
const FONT_TITLE = "'Playfair Display', 'Georgia', serif";
const FONT_ACCENT = "'Dancing Script', cursive";
const FONT_UI = "'Nunito', sans-serif";
const FONT_BRAND = "'Baloo 2', cursive";

const PAGE_W = 400;
const PAGE_H = 500;
const SPREAD_W = PAGE_W * 2;
const ANIM_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const ANIM_MS = 700;

/** Highlight child's name in bold within story text */
function renderStoryText(text: string, childName: string) {
  if (!childName) return text;
  const parts = text.split(new RegExp(`(${childName})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === childName.toLowerCase()
      ? <strong key={i} style={{ fontWeight: 700, color: '#FFE4B5' }}>{part}</strong>
      : part
  );
}

// ─── Story Page ───
const StoryPage = forwardRef<HTMLDivElement, {
  page: { text: string; imageUrl: string | null; pageNumber: number };
  childName: string;
  totalPages: number;
}>(({ page, childName, totalPages }, ref) => {
  return (
    <div ref={ref} style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#111',
    }}>
      {page.imageUrl ? (
        <img
          src={page.imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #1a0533, #2d1b69)',
        }} />
      )}

      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '45%',
        background: 'linear-gradient(to top, rgba(10,5,20,0.85) 0%, rgba(10,5,20,0.5) 60%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        bottom: '1.2rem', left: '1rem', right: '1rem',
        padding: '0.8rem 1rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: FONT_BODY,
          fontSize: '0.72rem',
          lineHeight: 1.75,
          color: '#f0ece4',
          margin: 0,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>
          {renderStoryText(page.text, childName)}
        </p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '0.3rem', right: '0.5rem',
        fontSize: '0.45rem',
        color: 'rgba(255,255,255,0.25)',
        fontFamily: FONT_UI,
        fontWeight: 600,
      }}>
        {page.pageNumber} / {totalPages}
      </div>
    </div>
  );
});

// ─── Cover Page ───
const CoverPage = forwardRef<HTMLDivElement, {
  title: string;
  childName: string;
  coverImageUrl?: string | null;
}>(({ title, childName, coverImageUrl }, ref) => (
  <div ref={ref} style={{
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #4a1a8a 100%)',
  }}>
    {coverImageUrl && (
      <img src={coverImageUrl} alt="" style={{
        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        filter: 'brightness(0.45)',
      }} />
    )}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      background: coverImageUrl
        ? 'linear-gradient(180deg, rgba(26,5,51,0.3) 0%, rgba(26,5,51,0.6) 100%)'
        : 'transparent',
    }}>
      <div style={{
        fontSize: '1.5rem', marginBottom: '0.5rem',
        filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.5))',
      }}>&#x2728;</div>

      <p style={{
        color: 'rgba(255,215,0,0.8)', fontSize: '0.7rem',
        fontFamily: FONT_ACCENT, margin: '0 0 0.3rem', letterSpacing: 2,
        textTransform: 'uppercase', textAlign: 'center',
      }}>
        A personalized story for
      </p>

      <h1 style={{
        color: '#fff', fontSize: '1.5rem', textAlign: 'center',
        fontFamily: FONT_BRAND, fontWeight: 800,
        textShadow: '0 2px 20px rgba(255,215,0,0.3), 0 4px 30px rgba(0,0,0,0.5)',
        lineHeight: 1.3, margin: '0 0 0.6rem', letterSpacing: 1,
      }}>
        {childName}
      </h1>

      <div style={{
        width: 60, height: 2,
        background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
        borderRadius: 1, margin: '0 0 0.8rem',
      }} />

      <h2 style={{
        color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', textAlign: 'center',
        fontFamily: FONT_TITLE, fontWeight: 400, fontStyle: 'italic',
        textShadow: '0 1px 8px rgba(0,0,0,0.4)',
        lineHeight: 1.5, margin: 0, maxWidth: '80%',
      }}>
        {title}
      </h2>

      <div style={{
        position: 'absolute', bottom: '1rem',
        fontSize: '0.55rem', color: 'rgba(255,215,0,0.4)',
        fontFamily: FONT_ACCENT, letterSpacing: 1, textAlign: 'center',
      }}>
        Once Upon a Time
      </div>
    </div>
  </div>
));

// ─── Back Cover ───
const BackCover = forwardRef<HTMLDivElement, { coverImageUrl?: string | null }>(
  ({ coverImageUrl }, ref) => (
    <div ref={ref} style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #2d1b69, #1a0533)',
    }}>
      {coverImageUrl && (
        <img src={coverImageUrl} alt="" style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          filter: 'brightness(0.3) blur(4px)',
        }} />
      )}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: coverImageUrl ? 'rgba(26,5,51,0.5)' : 'transparent',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.4))' }}>
          &#x2728;
        </div>
        <p style={{
          color: '#FFD700', fontSize: '1.4rem',
          fontFamily: FONT_ACCENT, margin: '0 0 1rem',
          textShadow: '0 2px 15px rgba(255,215,0,0.3)', textAlign: 'center',
        }}>
          The End
        </p>
        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)',
          margin: '0 0 1rem',
        }} />
        <p style={{
          color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem',
          fontFamily: FONT_ACCENT, margin: 0, letterSpacing: 1, textAlign: 'center',
        }}>
          Made with Once Upon a Time
        </p>
      </div>
    </div>
  )
);

// ─── Scroll Hint Arrow ───
function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 90,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.8s ease',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <span style={{
        fontFamily: FONT_UI,
        fontSize: '0.7rem',
        color: 'rgba(255,215,0,0.5)',
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        Scroll to flip
      </span>
      <div style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M7 10L12 15L17 10" stroke="rgba(255,215,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function PreviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFlipping = useRef(false);
  const [pages, setPages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [childName, setChildName] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [useSpread, setUseSpread] = useState(window.innerWidth >= 860);

  // Determine if this is a preview-only order (1 image) vs full book
  const pagesWithImages = pages.filter((p: any) => p.imageUrl);
  const totalStoryPages = pages.filter((p: any) => p.layout !== 'chapter-title').length;
  const isPreviewOnly = pagesWithImages.length <= 1 && totalStoryPages > 1
    && !['PAID', 'PRINTING', 'SHIPPED', 'DELIVERED'].includes(orderStatus);

  const totalBookPages = pages.length + 2;

  // Derive book visual phase
  const bookPhase: 'closed-front' | 'open' | 'closed-back' = !useSpread
    ? 'open'
    : currentPage === 0
    ? 'closed-front'
    : currentPage >= totalBookPages - 1
    ? 'closed-back'
    : 'open';

  // Viewport dimensions for opening/closing effect
  const viewportWidth = useSpread
    ? bookPhase === 'open' ? SPREAD_W : PAGE_W
    : PAGE_W;

  const bookShift = useSpread && bookPhase === 'closed-front' ? -PAGE_W : 0;

  // Dynamic shadow
  const bookShadow =
    bookPhase === 'closed-front'
      ? '8px 10px 40px rgba(0,0,0,0.5), 2px 4px 12px rgba(0,0,0,0.3), 0 0 60px rgba(255,215,0,0.03)'
      : bookPhase === 'closed-back'
      ? '-8px 10px 40px rgba(0,0,0,0.5), -2px 4px 12px rgba(0,0,0,0.3), 0 0 60px rgba(255,215,0,0.03)'
      : '0 10px 40px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3), 0 0 80px rgba(255,215,0,0.05)';

  // Responsive
  useEffect(() => {
    const handler = () => setUseSpread(window.innerWidth >= 860);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const fetchOrder = () => {
    if (!orderId) return;
    getOrder(orderId).then((data) => {
      const orderPages = data.order.pages || [];
      setPages(orderPages);
      setTitle(data.order.storyJson?.title || 'Your Storybook');
      setChildName(data.order.childName || '');
      setOrderStatus(data.order.status || '');
      const firstPageWithImage = orderPages.find((p: any) => p.imageUrl);
      setCoverImageUrl(firstPageWithImage?.imageUrl || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    if (!orderId) return;
    setPaying(true);
    try {
      const rzpOrder = await createRazorpayOrder(orderId);
      
      const options = {
        key: RZP_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Once Upon a Time',
        description: `Personalized storybook for ${childName}`,
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          try {
            await verifyRazorpayPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            alert('Payment Successful!');
            fetchOrder();
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#2d1b69'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Failed to initiate payment. Please try again.');
    }
    setPaying(false);
  };

  // Scroll-based page flipping (wheel)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isFlipping.current) return;
      if (Math.abs(e.deltaY) < 10) return;

      if (e.deltaY > 0) {
        bookRef.current?.pageFlip()?.flipNext();
      } else {
        bookRef.current?.pageFlip()?.flipPrev();
      }

      isFlipping.current = true;
      setShowScrollHint(false);
      setTimeout(() => { isFlipping.current = false; }, 1000);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [loading]);

  // Touch-based flipping (mobile vertical swipe)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading) return;

    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const deltaX = touchStartX - e.changedTouches[0].clientX;

      if (Math.abs(deltaY) < 40 || Math.abs(deltaX) > Math.abs(deltaY)) return;
      if (isFlipping.current) return;

      if (deltaY > 0) {
        bookRef.current?.pageFlip()?.flipNext();
      } else {
        bookRef.current?.pageFlip()?.flipPrev();
      }

      isFlipping.current = true;
      setShowScrollHint(false);
      setTimeout(() => { isFlipping.current = false; }, 1000);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [loading]);

  // Keyboard navigation
  useEffect(() => {
    if (loading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFlipping.current) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        bookRef.current?.pageFlip()?.flipNext();
        isFlipping.current = true;
        setShowScrollHint(false);
        setTimeout(() => { isFlipping.current = false; }, 1000);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        bookRef.current?.pageFlip()?.flipPrev();
        isFlipping.current = true;
        setTimeout(() => { isFlipping.current = false; }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading]);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0533, #2d1b69)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '3rem',
            animation: 'floatBook 2s ease-in-out infinite',
            marginBottom: '1rem',
          }}>&#x1F4D6;</div>
          <p style={{ fontFamily: FONT_UI, color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
            Opening your storybook...
          </p>
          <style>{`@keyframes floatBook { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
        </div>
      </div>
    );
  }

  const progress = totalBookPages > 1 ? currentPage / (totalBookPages - 1) : 0;

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #1a0533 0%, #2d1b69 40%, #1a0533 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <style>{`
        .stf__wrapper {
          box-shadow: none !important;
        }
        .stf__block {
          border-radius: 4px !important;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>

      {/* Background stars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            borderRadius: '50%',
            background: 'rgba(255,215,0,0.3)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Book title */}
      <div style={{
        textAlign: 'center',
        padding: '1.2rem 1rem 0.8rem',
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: FONT_BRAND,
          fontSize: '1.3rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 0.15rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}>
          {title}
        </h1>
        <p style={{
          fontFamily: FONT_ACCENT,
          fontSize: '0.85rem',
          color: '#FFD700',
          margin: 0,
        }}>
          Starring {childName}
        </p>
      </div>

      {/* Book — centered with opening/closing effect */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        minHeight: 0,
        padding: '0 1rem',
      }}>
        {/* Animated viewport — clips the book */}
        <div style={{
          width: viewportWidth,
          overflow: 'hidden',
          borderRadius: 6,
          boxShadow: bookShadow,
          transition: `width ${ANIM_MS}ms ${ANIM_EASE}, box-shadow ${ANIM_MS}ms ${ANIM_EASE}`,
          position: 'relative',
        }}>
          {/* Spine shadow (only when open in spread mode) */}
          {bookPhase === 'open' && useSpread && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 24,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 60%, transparent)',
              zIndex: 5,
              pointerEvents: 'none',
            }} />
          )}

          {/* Book container — shifts for cover display */}
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
              maxShadowOpacity={0.5}
              mobileScrollSupport={false}
              onFlip={handleFlip}
              style={{}}
              className=""
              startPage={0}
              minWidth={PAGE_W}
              maxWidth={PAGE_W}
              minHeight={PAGE_H}
              maxHeight={PAGE_H}
              drawShadow={true}
              flippingTime={800}
              usePortrait={!useSpread}
              startZIndex={0}
              autoSize={false}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={true}
              disableFlipByClick={false}
            >
              <CoverPage title={title} childName={childName} coverImageUrl={coverImageUrl} />
              {pages.map((page) => (
                <StoryPage
                  key={page.pageNumber}
                  page={page}
                  childName={childName}
                  totalPages={pages.length}
                />
              ))}
              <BackCover coverImageUrl={coverImageUrl} />
            </HTMLFlipBook>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <ScrollHint visible={showScrollHint} />

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 3,
        background: 'rgba(255,255,255,0.05)',
        zIndex: 20,
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #FFD700, #FFA500)',
          transition: 'width 0.6s ease',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 8px rgba(255,215,0,0.4)',
        }} />
      </div>

      {/* Bottom section — Preview paywall OR full book actions */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '0.8rem 1rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        flexShrink: 0,
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.75rem',
          fontFamily: FONT_UI,
          fontWeight: 600,
        }}>
          {currentPage + 1} / {totalBookPages}
        </span>

        {isPreviewOnly ? (
          /* ── PREVIEW MODE: show unlock CTA ── */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: FONT_UI,
              fontSize: '0.8rem',
              margin: 0,
              textAlign: 'center',
            }}>
              This is a preview. Unlock the full {totalStoryPages}-page storybook to download or order a print copy.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => navigate(`/checkout/${orderId}`)}
                style={{
                  padding: '0.7rem 2.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: FONT_UI,
                  borderRadius: 50,
                  border: 'none',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#1a0533',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 20px rgba(255,215,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(255,215,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,215,0,0.35)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Unlock Full Book
              </button>
              <button
                onClick={() => navigate('/create')}
                style={{
                  padding: '0.6rem 1.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  fontFamily: FONT_UI,
                  borderRadius: 50,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                Try Different Story
              </button>
            </div>
          </div>
        ) : (
          /* ── FULL BOOK MODE: download + order buttons ── */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={async () => {
                if (!orderId) return;
                setDownloading(true);
                try {
                  const blob = await downloadPdf(orderId);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${childName || 'storybook'}_storybook.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch {
                  alert('Failed to download PDF. Please try again.');
                }
                setDownloading(false);
              }}
              disabled={downloading}
              style={{
                padding: '0.65rem 2rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: FONT_UI,
                borderRadius: 50,
                border: 'none',
                background: downloading
                  ? 'rgba(255,215,0,0.3)'
                  : 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#1a0533',
                cursor: downloading ? 'wait' : 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: downloading ? 'none' : '0 4px 20px rgba(255,215,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (!downloading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(255,215,0,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                if (!downloading) e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,215,0,0.35)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloading ? 'Generating...' : 'Download eBook'}
            </button>

            {orderStatus === 'PREVIEW_READY' && (
              <button
                onClick={handlePayment}
                disabled={paying}
                style={{
                  padding: '0.65rem 2.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: FONT_UI,
                  borderRadius: 50,
                  border: 'none',
                  background: paying
                    ? 'rgba(255,215,0,0.5)'
                    : 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#1a0533',
                  cursor: paying ? 'wait' : 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 20px rgba(255,215,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {paying ? 'Initiating...' : 'Unlock eBook ₹499'}
              </button>
            )}
            <button
              onClick={() => navigate(`/checkout/${orderId}`)}
              style={{
                padding: '0.65rem 2rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: FONT_UI,
                borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = '#FFD700';
                e.currentTarget.style.color = '#FFD700';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Order Physical Book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
