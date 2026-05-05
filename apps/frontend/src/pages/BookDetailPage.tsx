import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BOOK_CATALOG } from '../data/bookCatalog';
import { getBookGallery } from '../data/bookAssets';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { formatINR } from '../utils/currency';
import { StarRating } from '../components/reviews/StarRating';
import { ReviewList } from '../components/reviews/ReviewList';
import { ReviewForm } from '../components/reviews/ReviewForm';

/* ─── Per-book descriptions ──────────────────────────────────────────── */

const BOOK_DESCRIPTIONS: Record<string, string> = {
  'boy-dragon-friend':
    "Strap on your cape and step into the enchanted forest! Your child meets Spark, a tiny green baby dragon with bright orange wings, and together they cross a crystal river, outwit pixies, and rescue Spark's mother from a fallen ancient tree. A heartwarming tale of bravery, teamwork, and an unbreakable friendship between a brave little hero and a baby dragon.",
  'girl-tooth-fairy':
    "When your child loses her first tooth and tucks it under the pillow, a tiny pixie named Twinkle appears in a swirl of golden sparkles. Together they fly past clouds and stars to a crystal castle in the sky, where she discovers the magical secret of where every lost tooth goes — a gentle bedtime tale about wonder, courage, and the magic hiding in everyday moments.",
};

const BOOK_FEATURES: Record<string, { icon: string; text: string }[]> = {
  default: [
    { icon: 'smile', text: 'Perfect for kids ages **3 to 8** years old' },
    { icon: 'lightbulb', text: 'Teaches **courage** & **friendship**' },
    { icon: 'book', text: '**16** Beautifully illustrated pages' },
    { icon: 'eye', text: '**Preview** available before ordering' },
  ],
};

/* ─── Component ──────────────────────────────────────────────────────── */

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const book = BOOK_CATALOG.find((b) => b.id === slug);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { pricing } = usePricing();

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const fetchReviews = async () => {
    if (!book) return;
    setIsLoadingReviews(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/reviews/${book.id}`),
        fetch(`${apiUrl}/reviews/${book.id}/stats`)
      ]);
      
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    setActiveIndex(0);
    setIsPlaying(true);
    fetchReviews();
  }, [slug]);

  const galleryItems = useMemo(
    () => getBookGallery(book?.slug ?? '', book?.thumbnail ?? ''),
    [book?.slug, book?.thumbnail],
  );

  if (!book) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <h2 className="font-display" style={{ fontSize: 28, color: '#111' }}>Book not found</h2>
        <Link to="/templates" className="font-body" style={{ color: '#111', fontSize: 15 }}>
          Browse all books
        </Link>
      </div>
    );
  }

  const description = BOOK_DESCRIPTIONS[book.id] || BOOK_DESCRIPTIONS['boy-dragon-friend']!;
  const features = BOOK_FEATURES.default;
  const activeItem = galleryItems[activeIndex] ?? galleryItems[0]!;
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
    setActiveIndex((prev) => (prev <= 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev >= galleryItems.length - 1 ? 0 : prev + 1));
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
          <span style={{ color: '#111', fontWeight: 600 }}>{book.title}</span>
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
            {galleryItems.map((item, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setIsPlaying(false); }}
                className="liquid-glass"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: activeIndex === i ? '3px solid #111' : '2px solid transparent',
                  padding: 0,
                  cursor: 'pointer',
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
            className="liquid-glass"
            style={{
              flex: 1,
              borderRadius: 20,
              overflow: 'hidden',
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
                background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
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
              {galleryItems.map((_, i) => (
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
        <div
          className="book-detail-info liquid-glass-strong"
          style={{ flex: 1, minWidth: 0, borderRadius: 24, padding: '32px 28px' }}
        >
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
            <StarRating rating={stats.averageRating} size={20} />
            <span className="font-body" style={{ fontSize: 14, color: '#9ca3af' }}>
              ({stats.totalReviews}) {stats.totalReviews === 1 ? 'Review' : 'Reviews'}
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
            {description}
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {features.map((feat, i) => (
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
          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '0 0 24px' }} />

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
            <span className="font-body" style={{ fontSize: 16, color: '#6b7280' }}>From</span>
            <span className="font-body" style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>
              {formatINR(pricing.premadeStartingPrice)}
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePersonalize}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '18px 32px',
              fontSize: 17,
              borderRadius: 14,
              letterSpacing: 0.3,
            }}
          >
            Personalise my book
          </button>

        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ background: '#fcfcfc', borderTop: '1px solid rgba(0,0,0,0.05)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <h2 className="font-display" style={{ fontSize: 32, marginBottom: 32 }}>Customer Reviews</h2>
              <ReviewList reviews={reviews} isLoading={isLoadingReviews} />
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <ReviewForm bookId={book.id} onSuccess={fetchReviews} />
            </div>
          </div>
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

/* ─── Feature Icons ─────────────────────────────────────────────────── */

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
