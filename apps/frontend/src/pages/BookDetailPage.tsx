import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BOOK_CATALOG } from '../data/bookCatalog';
import { useAuth } from '../context/AuthContext';

/* ─── Static demo data (will become dynamic per-book later) ──────────── */

const DEMO_DESCRIPTION =
  "When a dragon flies into a peaceful village, everyone is scared and hides. But one brave child notices that something is different. The dragon wasn't weird or dangerous, he was just lonely. By listening, helping, and being kind, fear turns into smiles, games, and a new, precious friendship. This personalised story shows children that being a hero doesn't always mean fighting. It can mean understanding, caring, and doing the right thing.";

const DEMO_FEATURES = [
  { icon: 'smile', text: 'Perfect for kids ages **6 to 12** years old' },
  { icon: 'lightbulb', text: 'Teaches **courage** & **friendship**' },
  { icon: 'book', text: '**30** Beautifully illustrated pages' },
  { icon: 'eye', text: '**Preview** available before ordering' },
];

const GALLERY_ITEMS = [
  { type: 'video' as const, src: '/preview_video/00-super-boy-video.mp4', thumb: '/preview_video/01-video-thumbnail.webp' },
  { type: 'image' as const, src: '/preview_video/02-book-open-spread.webp', thumb: '/preview_video/02-book-open-spread.webp' },
  { type: 'image' as const, src: '/preview_video/03-book-illustration.webp', thumb: '/preview_video/03-book-illustration.webp' },
  { type: 'image' as const, src: '/preview_video/04-personalized-child.webp', thumb: '/preview_video/04-personalized-child.webp' },
  { type: 'image' as const, src: '/preview_video/05-book-page.webp', thumb: '/preview_video/05-book-page.webp' },
  { type: 'image' as const, src: '/preview_video/06-book-page-2.webp', thumb: '/preview_video/06-book-page-2.webp' },
];

/* ─── Component ──────────────────────────────────────────────────────── */

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const book = BOOK_CATALOG.find((b) => b.id === slug);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state when slug changes
  useEffect(() => {
    setActiveIndex(0);
    setIsPlaying(true);
  }, [slug]);

  if (!book) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <h2 className="font-display" style={{ fontSize: 28, color: '#111' }}>Book not found</h2>
        <Link to="/templates" className="font-body" style={{ color: '#7c3aed', fontSize: 15 }}>
          Browse all books
        </Link>
      </div>
    );
  }

  const activeItem = GALLERY_ITEMS[activeIndex];
  const isVideo = activeItem.type === 'video';

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev <= 0 ? GALLERY_ITEMS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev >= GALLERY_ITEMS.length - 1 ? 0 : prev + 1));
  };

  const handlePersonalize = () => {
    if (isAuthenticated) {
      navigate(`/personalize/${book.slug}`);
    } else {
      navigate('/login', { state: { from: `/personalize/${book.slug}` } });
    }
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
    );
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
        <nav className="font-body" style={{ fontSize: 13, color: '#9ca3af' }}>
          <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <Link to="/templates" style={{ color: '#9ca3af', textDecoration: 'none' }}>Books</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: '#6b21a8', fontWeight: 600 }}>{book.title}</span>
        </nav>
      </div>

      {/* Main content */}
      <div
        className="book-detail-layout"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 24px 80px',
          display: 'flex',
          gap: 48,
          alignItems: 'flex-start',
        }}
      >
        {/* ─── Left: Gallery ──────────────────────────────────── */}
        <div
          className="book-detail-gallery"
          style={{ flex: '0 0 55%', display: 'flex', gap: 12 }}
        >
          {/* Thumbnail strip */}
          <div
            className="book-detail-thumbstrip"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flex: '0 0 80px',
            }}
          >
            {GALLERY_ITEMS.map((item, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setIsPlaying(false); }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: activeIndex === i ? '3px solid #7c3aed' : '2px solid #e5e7eb',
                  padding: 0,
                  cursor: 'pointer',
                  background: '#f3f4f6',
                  position: 'relative',
                  transition: 'border-color 0.2s',
                }}
              >
                <img
                  src={item.thumb}
                  alt={`Preview ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {item.type === 'video' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.25)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Main preview */}
          <div
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#f3f4f6',
              position: 'relative',
              aspectRatio: '1 / 1',
            }}
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={activeItem.src}
                poster={activeItem.thumb}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onEnded={() => setIsPlaying(false)}
                playsInline
                autoPlay
                muted
              />
            ) : (
              <img
                src={activeItem.src}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}

            {/* Nav arrows + play/pause */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '16px 0 20px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.35))',
              }}
            >
              <button onClick={handlePrev} style={navBtnStyle} aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
              </button>
              {isVideo && (
                <button onClick={handlePlayPause} style={navBtnStyle} aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
              )}
              <button onClick={handleNext} style={navBtnStyle} aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
              </button>
            </div>

            {/* Dot indicators */}
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
              }}
            >
              {GALLERY_ITEMS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: activeIndex === i ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right: Details ─────────────────────────────────── */}
        <div className="book-detail-info" style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: '"Parkinsans", sans-serif',
              fontSize: 34,
              fontWeight: 700,
              color: '#000',
              margin: '0 0 12px',
              lineHeight: 1.0,
              letterSpacing: '-0.05px',
            }}
          >
            {book.title}
          </h1>

          {/* Star rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill="#FBBF24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="font-body" style={{ fontSize: 14, color: '#9ca3af' }}>
              (4,283) Reviews
            </span>
          </div>

          {/* Description */}
          <p
            className="font-body"
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: '#374151',
              margin: '0 0 28px',
            }}
          >
            {DEMO_DESCRIPTION}
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {DEMO_FEATURES.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
                  <FeatureIcon name={feat.icon} />
                </span>
                <span className="font-body" style={{ fontSize: 15, color: '#374151' }}>
                  {renderBoldText(feat.text)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 24px' }} />

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
            <span className="font-body" style={{ fontSize: 16, color: '#6b7280' }}>From</span>
            <span className="font-body" style={{ fontSize: 28, fontWeight: 700, color: '#7c3aed' }}>
              {book.priceFormatted}
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePersonalize}
            className="font-body"
            style={{
              width: '100%',
              padding: '18px 32px',
              fontSize: 17,
              fontWeight: 700,
              color: '#fff',
              background: '#C4A0F0',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              letterSpacing: 0.3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(196,160,240,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Personalise my book
          </button>

        </div>
      </div>

      {/* ─── Responsive styles ──────────────────────────────── */}
      <style>{`
        @media (max-width: 860px) {
          .book-detail-layout {
            flex-direction: column !important;
            gap: 32px !important;
          }
          .book-detail-gallery {
            flex: 1 1 auto !important;
            width: 100% !important;
          }
          .book-detail-info {
            width: 100% !important;
          }
        }
        @media (max-width: 520px) {
          .book-detail-thumbstrip {
            display: none !important;
          }
          .book-detail-info h1 {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Feature Icons (SVG, matching WonderWraps style) ─────────────────── */

function FeatureIcon({ name }: { name: string }) {
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#6b7280', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'smile':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
    case 'lightbulb':
      return <svg {...props}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>;
    case 'book':
      return <svg {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
    case 'eye':
      return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    default:
      return null;
  }
}

/* ─── Shared styles ───────────────────────────────────────────────────── */

const navBtnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(4px)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
};
