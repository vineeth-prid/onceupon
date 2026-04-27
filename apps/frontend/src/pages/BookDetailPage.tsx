import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BOOK_CATALOG } from '../data/bookCatalog';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { StarRating } from '../components/reviews/StarRating';
import { ReviewList } from '../components/reviews/ReviewList';
import { ReviewForm } from '../components/reviews/ReviewForm';

/* ─── Per-book descriptions ──────────────────────────────────────────── */

const BOOK_DESCRIPTIONS: Record<string, string> = {
  'portugals-new-legend':
    "Step onto the pitch and become a legend! In this personalised adventure, your child discovers a magical football that glows with golden light. Guided by the spirits of legendary players, they train in an enchanted stadium, learn the power of teamwork, and score the winning goal in a tournament that will be remembered forever.",
  'girl-saves-arctic':
    "When the Arctic Kingdom freezes over in an eternal blizzard, only one brave child can save it. Your little one befriends a wise snow fox, crosses glittering ice bridges, and discovers the warmth that lies within the Northern Lights. A story about courage, kindness, and the magic of believing in yourself.",
  'vroom-vroom-boy':
    "Rev those engines! Your child builds a magical race car from pure imagination and enters the most extraordinary race ever — through candy canyons, across cloud highways, and under the sea. But the real lesson? Winning isn't about being fastest; it's about being the cleverest and kindest racer on the track.",
  'super-boy-dragon':
    "Deep in an enchanted forest, your child discovers a tiny baby dragon who's lost and afraid. Together, they explore crystal caves, mushroom meadows, and a hidden cloud castle. When a storm threatens the dragon's egg siblings, your little hero must find the courage to save them all.",
  'girl-lost-fairy-wings':
    "The fairy realm is in trouble — a mysterious spell has stolen every fairy's wings! Your child embarks on a magical quest to collect four enchanted ingredients: a moonlit dewdrop, a singing flower petal, starlight dust, and a crystal tear. Can they break the spell and restore the magic?",
  'boy-cosmic-journey':
    "3, 2, 1... Blast off! Your child builds a rocket from pure imagination and soars into the cosmos. They explore candy-coloured nebulae, befriend a tiny alien on a crystal planet, and navigate asteroid fields. The most beautiful discovery? Earth, shining like a blue jewel when seen from the stars.",
  'boy-explores-zoo':
    "Welcome to the most magical zoo on Earth! Your child discovers that every animal glows with a colourful aura that shows their feelings. From a lonely elephant with a blue glow to playful monkeys sparkling gold, this heartwarming story teaches empathy, kindness, and the joy of helping others.",
  'girl-explores-zoo':
    "Welcome to the most magical zoo on Earth! Your child discovers that every animal glows with a colourful aura that shows their feelings. From a lonely elephant with a blue glow to playful dolphins sparkling turquoise, this heartwarming story teaches empathy, kindness, and the joy of helping others.",
  'boy-talk-to-animals':
    "When your child finds a mysterious ancient amulet in the garden, they discover an incredible gift — they can understand every animal's language! A wise old owl, a chatty squirrel, and a council of forest creatures all need help. Their ancient tree is sick, and only by listening to every animal can the cure be found.",
};

const BOOK_FEATURES: Record<string, { icon: string; text: string }[]> = {
  default: [
    { icon: 'smile', text: 'Perfect for kids ages **3 to 8** years old' },
    { icon: 'lightbulb', text: 'Teaches **courage** & **friendship**' },
    { icon: 'book', text: '**16** Beautifully illustrated pages' },
    { icon: 'eye', text: '**Preview** available before ordering' },
  ],
};

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
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

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

  const description = BOOK_DESCRIPTIONS[book.id] || BOOK_DESCRIPTIONS['super-boy-dragon']!;
  const features = BOOK_FEATURES.default;
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
            {GALLERY_ITEMS.map((item, i) => (
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
              background: '#111',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              letterSpacing: 0.3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Personalise my book
          </button>

          {/* Add to Cart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (book) addToCart(book);
              setAddedToCart(true);
              setTimeout(() => setAddedToCart(false), 1500);
            }}
            className="font-body"
            style={{
              width: '100%',
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 600,
              color: addedToCart ? '#16a34a' : '#111',
              background: '#fff',
              border: `2px solid ${addedToCart ? '#16a34a' : '#111'}`,
              borderRadius: 14,
              cursor: 'pointer',
              marginTop: 12,
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {addedToCart ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                Added to Cart!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Add to Cart
              </>
            )}
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
