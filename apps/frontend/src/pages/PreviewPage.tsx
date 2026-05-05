import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { getOrder, downloadPdf, createRazorpayOrder, verifyRazorpayPayment, completeOrder } from '../api/orders';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';

const RZP_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const FONT_BODY = "'Crimson Text', 'Georgia', serif";
const FONT_TITLE = "'Playfair Display', 'Georgia', serif";
const FONT_ACCENT = "'Dancing Script', cursive";
const FONT_UI = "'Inter', sans-serif";
const FONT_HEADING = "'Instrument Serif', serif";
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
  displayPageNumber: number;
}>(({ page, childName, totalPages, displayPageNumber }, ref) => {
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
        {displayPageNumber} / {totalPages}
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
        filter: 'brightness(0.40)',
      }} />
    )}
    {/* Vignette overlay */}
    <div style={{
      position: 'absolute', inset: 0,
      background: coverImageUrl
        ? 'radial-gradient(ellipse at center, rgba(26,5,51,0.15) 0%, rgba(26,5,51,0.65) 100%)'
        : 'transparent',
    }} />

    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem',
      gap: 0,
    }}>
      {/* Top sparkle row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', opacity: 0.8 }}>
        {['✦', '✧', '✦'].map((s, i) => (
          <span key={i} style={{ fontSize: i === 1 ? '1.1rem' : '0.6rem', color: '#FFD700', opacity: i === 1 ? 1 : 0.6 }}>{s}</span>
        ))}
      </div>

      {/* Tagline */}
      <p style={{
        color: 'rgba(255,215,0,0.85)',
        fontSize: '0.62rem',
        fontFamily: FONT_ACCENT,
        margin: '0 0 0.45rem',
        letterSpacing: 3,
        textTransform: 'uppercase',
        textAlign: 'center',
        textShadow: '0 1px 6px rgba(0,0,0,0.5)',
      }}>
        A personalised story for
      </p>

      {/* Child's Name — hero text */}
      <h1 style={{
        color: '#ffffff',
        fontSize: '2.6rem',
        textAlign: 'center',
        fontFamily: FONT_BRAND,
        fontWeight: 900,
        textShadow: '0 0 30px rgba(255,215,0,0.55), 0 2px 16px rgba(255,180,0,0.4), 0 4px 40px rgba(0,0,0,0.7)',
        lineHeight: 1.1,
        margin: '0 0 0.6rem',
        letterSpacing: 2,
        wordBreak: 'break-word',
      }}>
        {childName}
      </h1>

      {/* Divider */}
      <div style={{
        width: 80, height: 2,
        background: 'linear-gradient(90deg, transparent, #FFD700 30%, #FFD700 70%, transparent)',
        borderRadius: 1, margin: '0 0 0.85rem',
        boxShadow: '0 0 8px rgba(255,215,0,0.4)',
      }} />

      {/* Book Title */}
      <h2 style={{
        color: 'rgba(255,255,255,0.92)',
        fontSize: '1.15rem',
        textAlign: 'center',
        fontFamily: FONT_TITLE,
        fontWeight: 600,
        fontStyle: 'italic',
        textShadow: '0 1px 10px rgba(0,0,0,0.6)',
        lineHeight: 1.4,
        margin: 0,
        maxWidth: '85%',
        letterSpacing: 0.5,
      }}>
        {title}
      </h2>
    </div>

    {/* Brand footer */}
    <div style={{
      position: 'absolute', bottom: '1rem', left: 0, right: 0,
      textAlign: 'center',
      fontSize: '0.5rem', color: 'rgba(255,215,0,0.45)',
      fontFamily: FONT_ACCENT, letterSpacing: 1.5,
    }}>
      Once Upon a Time
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
        color: 'rgba(0,0,0,0.4)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        Scroll to flip
      </span>
      <div style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M7 10L12 15L17 10" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function PreviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFlipping = useRef(false);
  const [pages, setPages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [childName, setChildName] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderPaymentId, setOrderPaymentId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [useSpread, setUseSpread] = useState(window.innerWidth >= 860);
  const { pricing } = usePricing();
  const ebookPrice = pricing.ebookPrice;
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pagesWithImages = pages.filter((p: any) => p.imageUrl);
  const totalStoryPages = pages.filter((p: any) => p.layout !== 'chapter-title').length;

  // Use payment status to determine if preview wall should be shown
  const isPaid = ['PAID', 'PRINTING', 'SHIPPED', 'DELIVERED'].includes(orderStatus) || !!orderPaymentId;

  // Detect if full book generation is still in progress after payment
  const isGenerating = isPaid && (
    ['PAID', 'IMAGES_GENERATING', 'STORY_GENERATING', 'STORY_COMPLETE'].includes(orderStatus) ||
    (totalStoryPages > 1 && pages.some((p: any) => p.status === 'PENDING' || p.status === 'GENERATING'))
  );

  // Admin viewing mode — hide customer-facing purchase buttons
  const isAdmin = user?.role === 'ADMIN';

  // Compute generation progress for paid orders
  const completedPages = pages.filter((p: any) => p.status === 'COMPLETE').length;
  const generationProgress = totalStoryPages > 0 ? Math.round((completedPages / totalStoryPages) * 100) : 0;

  const filteredPages = pages.filter((p: any) => p.layout !== 'chapter-title');
  const totalBookPages = filteredPages.length + 2;

  // After payment, the backend briefly deletes preview pages before recreating full pages.
  // During this window, show a dedicated "preparing" screen instead of a broken flipbook.
  const showFullScreenGenerating = isPaid && filteredPages.length === 0;

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

  // Subtle shadow on light theme
  const bookShadow =
    bookPhase === 'closed-front'
      ? '8px 14px 36px rgba(45, 27, 105, 0.18), 2px 4px 12px rgba(45, 27, 105, 0.10)'
      : bookPhase === 'closed-back'
      ? '-8px 14px 36px rgba(45, 27, 105, 0.18), -2px 4px 12px rgba(45, 27, 105, 0.10)'
      : '0 14px 40px rgba(45, 27, 105, 0.18), 0 2px 10px rgba(45, 27, 105, 0.10)';

  // Responsive
  useEffect(() => {
    const handler = () => setUseSpread(window.innerWidth >= 860);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const fetchOrder = useCallback(() => {
    if (!orderId) return;
    getOrder(orderId).then((data) => {
      const orderPages = data.order.pages || [];
      setPages(orderPages);
      setTitle(data.order.storyJson?.title || 'Your Storybook');
      setChildName(data.order.childName || '');
      setOrderPaymentId(data.order.paymentId || null);
      setOrderStatus(data.order.status || '');

      const firstPageWithImage = orderPages.find((p: any) => p.imageUrl);
      setCoverImageUrl((prev) => firstPageWithImage?.imageUrl || prev);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [orderId, fetchOrder]);

  // Poll for order updates while generation is in progress
  useEffect(() => {
    if (isGenerating && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        fetchOrder();
      }, 5000);
    }
    if (!isGenerating && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isGenerating, fetchOrder]);

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
            toast.success('Payment Successful!');
            // Optimistically flip to "paid" so the UI doesn't render a stale preview-paywall
            // for the brief window before fetchOrder resolves with the new server state.
            setOrderPaymentId(response.razorpay_payment_id);
            setOrderStatus('PAID');
            fetchOrder();
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#16a34a'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment. Please try again.');
    }
    setPaying(false);
  };

  // Scroll-based page flipping (wheel)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading || showFullScreenGenerating) return;

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
  }, [loading, showFullScreenGenerating]);

  // Touch-based flipping (mobile vertical swipe)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading || showFullScreenGenerating) return;

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
  }, [loading, showFullScreenGenerating]);

  // Keyboard navigation
  useEffect(() => {
    if (loading || showFullScreenGenerating) return;

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
  }, [loading, showFullScreenGenerating]);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const PAGE_BG = 'linear-gradient(180deg, #EDE4F8 0%, #E2D6F5 45%, #D5C4ED 100%)';

  const BackButton = (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      }}
      title="Go back"
      style={{
        position: 'absolute',
        top: '1.2rem',
        left: '1.2rem',
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 999,
        padding: '0.5rem 1rem 0.5rem 0.85rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: '#222',
        fontFamily: FONT_UI,
        fontSize: '0.85rem',
        fontWeight: 600,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back
    </button>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: PAGE_BG,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '3rem',
            animation: 'floatBook 2s ease-in-out infinite',
            marginBottom: '1rem',
          }}>&#x1F4D6;</div>
          <p style={{ fontFamily: FONT_UI, color: '#666', fontSize: '1rem', fontWeight: 500 }}>
            Opening your storybook...
          </p>
          <style>{`@keyframes floatBook { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
        </div>
      </div>
    );
  }

  // Dedicated screen during the brief window after payment when pages are being recreated.
  if (showFullScreenGenerating) {
    return (
      <div style={{
        minHeight: '100vh',
        background: PAGE_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
      }}>
        {BackButton}
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: 28,
          padding: '2.5rem 2rem',
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}>
          <div style={{
            fontSize: '3rem',
            animation: 'floatBook 2.5s ease-in-out infinite',
            marginBottom: '1.2rem',
          }}>✨</div>
          <h2 style={{
            fontFamily: FONT_HEADING,
            fontSize: '1.6rem',
            fontWeight: 400,
            color: '#111',
            margin: '0 0 0.6rem',
          }}>
            Crafting your storybook
          </h2>
          <p style={{
            fontFamily: FONT_UI,
            fontSize: '0.95rem',
            color: '#666',
            margin: '0 0 1.5rem',
            lineHeight: 1.5,
          }}>
            Payment received. We're now generating every page of <strong>{title}</strong> for {childName}. This can take a few minutes.
          </p>
          <div style={{
            width: '100%',
            height: 6,
            background: 'rgba(0,0,0,0.06)',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, #16a34a, transparent)',
              animation: 'shimmer 1.8s ease-in-out infinite',
            }} />
          </div>
          <p style={{
            fontFamily: FONT_UI,
            fontSize: '0.78rem',
            color: '#999',
            margin: '1rem 0 0',
          }}>
            You can safely close this page and come back later.
          </p>
          <style>{`
            @keyframes floatBook { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          `}</style>
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
        background: PAGE_BG,
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
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>

      {BackButton}

      {/* Soft decorative dots */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', opacity: 0.5 }}>
        <div style={{ position: 'absolute', top: '8%', left: '6%', width: 6, height: 6, borderRadius: '50%', background: '#FFD700' }} />
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 4, height: 4, borderRadius: '50%', background: '#AB47BC' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '4%', width: 5, height: 5, borderRadius: '50%', background: '#16a34a' }} />
        <div style={{ position: 'absolute', bottom: '12%', right: '6%', width: 4, height: 4, borderRadius: '50%', background: '#FFD700' }} />
      </div>

      {/* Book title */}
      <div style={{
        textAlign: 'center',
        padding: '1.4rem 1rem 0.6rem',
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: FONT_HEADING,
          fontSize: '1.6rem',
          fontWeight: 400,
          color: '#111',
          margin: '0 0 0.15rem',
          letterSpacing: 0.2,
        }}>
          {title}
        </h1>
        <p style={{
          fontFamily: FONT_UI,
          fontSize: '0.78rem',
          color: '#7B3FA0',
          fontWeight: 600,
          margin: 0,
          letterSpacing: 0.3,
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
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.12) 60%, transparent)',
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
            <HTMLFlipBook
              key={`${useSpread ? 'spread' : 'portrait'}-${filteredPages.length}`}
              ref={bookRef}
              width={PAGE_W}
              height={PAGE_H}
              size="fixed"
              showCover={true}
              maxShadowOpacity={0.4}
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
              {filteredPages.map((page, idx) => (
                <StoryPage
                  key={page.pageNumber}
                  page={page}
                  childName={childName}
                  totalPages={filteredPages.length}
                  displayPageNumber={idx + 1}
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
        background: 'rgba(0,0,0,0.05)',
        zIndex: 20,
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #16a34a, #AB47BC)',
          transition: 'width 0.6s ease',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* Bottom section — Preview paywall OR full book actions */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '0.8rem 1rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.7rem',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#999',
          fontSize: '0.72rem',
          fontFamily: FONT_UI,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}>
          {currentPage + 1} / {totalBookPages}
        </span>

        {!isPaid ? (
          /* ── UNPAID: show unlock CTA (hidden for admins) ── */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.7rem',
          }}>
            {isAdmin ? (
              <p style={{
                color: '#AB47BC',
                fontFamily: FONT_UI,
                fontSize: '0.8rem',
                fontWeight: 600,
                margin: 0,
                textAlign: 'center',
                padding: '6px 16px',
                borderRadius: 999,
                border: '1px solid rgba(171, 71, 188, 0.25)',
                background: 'rgba(171, 71, 188, 0.06)',
              }}>
                👁 Viewing as Admin — Preview only (unpaid order)
              </p>
            ) : (
              <>
                <p style={{
                  color: '#555',
                  fontFamily: FONT_UI,
                  fontSize: '0.85rem',
                  margin: 0,
                  textAlign: 'center',
                  maxWidth: 480,
                }}>
                  This is a preview. Unlock the full storybook to download or order a print copy.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.8rem',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    {paying ? 'Initiating...' : `Unlock eBook ₹${ebookPrice}`}
                  </button>
                  <button
                    onClick={() => navigate(`/checkout/${orderId}`)}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    Order Physical Book
                  </button>
                </div>
              </>
            )}
          </div>
        ) : isGenerating ? (
          /* ── GENERATING MODE: show progress while book is being created ── */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.85rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 18,
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}>
            <p style={{
              color: '#222',
              fontFamily: FONT_UI,
              fontSize: '0.88rem',
              fontWeight: 600,
              margin: 0,
              textAlign: 'center',
            }}>
              ✨ Your full storybook is being created…
            </p>
            <div style={{
              width: 240,
              height: 6,
              background: 'rgba(0,0,0,0.07)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.max(generationProgress, 5)}%`,
                background: 'linear-gradient(90deg, #16a34a, #AB47BC)',
                borderRadius: 3,
                transition: 'width 1s ease',
              }} />
            </div>
            <p style={{
              color: '#666',
              fontFamily: FONT_UI,
              fontSize: '0.72rem',
              margin: 0,
            }}>
              {completedPages} of {totalStoryPages} pages ready ({generationProgress}%)
            </p>
          </div>
        ) : (
          /* ── PAID & COMPLETE: download + order buttons ── */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
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
                  a.download = `${childName.replace(/[^a-zA-Z0-9]/g, '_') || 'storybook'}_storybook.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch (err: any) {
                  console.error('Download error:', err);
                  const status = err.response?.status;
                  if (status === 404) {
                    alert('Book not ready yet. Please wait for images to finish generating.');
                  } else {
                    alert('Download failed. The system is still preparing your high-quality PDF. Please try again in a minute.');
                  }
                }
                setDownloading(false);
              }}
              disabled={downloading}
              className="btn-primary"
              style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloading ? 'Generating...' : 'Download eBook'}
            </button>

            {orderStatus === 'FAILED' && (
              <button
                onClick={async () => {
                  try {
                    await completeOrder(orderId!);
                    toast.success('Re-starting generation. Please wait a few minutes.');
                    fetchOrder();
                  } catch (err) {
                    toast.error('Failed to retry. Please contact support.');
                  }
                }}
                className="btn-primary"
                style={{
                  padding: '0.75rem 1.6rem',
                  fontSize: '0.95rem',
                  background: '#FF6B6B',
                  color: '#fff',
                  borderColor: '#FF6B6B',
                }}
              >
                Retry Generation
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={() => navigate(`/checkout/${orderId}`)}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Order Physical Book
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
