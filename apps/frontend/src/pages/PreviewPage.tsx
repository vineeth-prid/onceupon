import { useState, useEffect, useRef, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { getOrder } from '../api/orders';

const FONT_BODY = "'Crimson Text', 'Georgia', serif";
const FONT_TITLE = "'Playfair Display', 'Georgia', serif";
const FONT_ACCENT = "'Dancing Script', cursive";
const FONT_UI = "'Nunito', sans-serif";
const FONT_BRAND = "'Baloo 2', cursive";

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

      {/* Dark gradient overlay at bottom for text readability */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '45%',
        background: 'linear-gradient(to top, rgba(10,5,20,0.85) 0%, rgba(10,5,20,0.5) 60%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Text overlay - always centered at bottom */}
      <div style={{
        position: 'absolute',
        bottom: '1.2rem',
        left: '1rem',
        right: '1rem',
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

      {/* Page number */}
      <div style={{
        position: 'absolute',
        bottom: '0.3rem',
        right: '0.5rem',
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
      {/* Top decorative sparkle */}
      <div style={{
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
        filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.5))',
      }}>&#x2728;</div>

      <p style={{
        color: 'rgba(255,215,0,0.8)', fontSize: '0.7rem',
        fontFamily: FONT_ACCENT, margin: '0 0 0.3rem', letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        A personalized story for
      </p>

      <h1 style={{
        color: '#fff', fontSize: '1.5rem', textAlign: 'center',
        fontFamily: FONT_BRAND, fontWeight: 800,
        textShadow: '0 2px 20px rgba(255,215,0,0.3), 0 4px 30px rgba(0,0,0,0.5)',
        lineHeight: 1.3, margin: '0 0 0.6rem',
        letterSpacing: 1,
      }}>
        {childName}
      </h1>

      {/* Gold divider */}
      <div style={{
        width: 60,
        height: 2,
        background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
        borderRadius: 1,
        margin: '0 0 0.8rem',
      }} />

      <h2 style={{
        color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', textAlign: 'center',
        fontFamily: FONT_TITLE, fontWeight: 400, fontStyle: 'italic',
        textShadow: '0 1px 8px rgba(0,0,0,0.4)',
        lineHeight: 1.5, margin: 0,
        maxWidth: '80%',
      }}>
        {title}
      </h2>

      {/* Bottom branding */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        fontSize: '0.55rem',
        color: 'rgba(255,215,0,0.4)',
        fontFamily: FONT_ACCENT,
        letterSpacing: 1,
        textAlign: 'center',
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
          textShadow: '0 2px 15px rgba(255,215,0,0.3)',
          textAlign: 'center',
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
          fontFamily: FONT_ACCENT, margin: 0, letterSpacing: 1,
          textAlign: 'center',
        }}>
          Made with Once Upon a Time
        </p>
      </div>
    </div>
  )
);

export function PreviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const bookRef = useRef<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [childName, setChildName] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    getOrder(orderId).then((data) => {
      const orderPages = data.order.pages || [];
      setPages(orderPages);
      setTitle(data.order.storyJson?.title || 'Your Storybook');
      setChildName(data.order.childName || '');
      // Use first story page image for cover (not the reference sheet)
      const firstPageWithImage = orderPages.find((p: any) => p.imageUrl);
      setCoverImageUrl(firstPageWithImage?.imageUrl || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

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

  const totalBookPages = pages.length + 2;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0533 0%, #2d1b69 40%, #1a0533 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem 1rem 2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        .stf__wrapper {
          box-shadow:
            0 10px 40px rgba(0,0,0,0.5),
            0 2px 10px rgba(0,0,0,0.3),
            0 0 80px rgba(255,215,0,0.05) !important;
          border-radius: 6px !important;
        }
        .stf__block {
          border-radius: 4px !important;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
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
        marginBottom: '1.2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <h1 style={{
          fontFamily: FONT_BRAND,
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 0.2rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}>
          {title}
        </h1>
        <p style={{
          fontFamily: FONT_ACCENT,
          fontSize: '0.9rem',
          color: '#FFD700',
          margin: 0,
        }}>
          Starring {childName}
        </p>
      </div>

      {/* Book */}
      <div style={{
        width: 400,
        height: 500,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Book spine shadow */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 10,
          bottom: 10,
          width: 20,
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.3)',
          filter: 'blur(8px)',
          zIndex: -1,
        }} />

        <HTMLFlipBook
          ref={bookRef}
          width={400}
          height={500}
          size="fixed"
          showCover={true}
          maxShadowOpacity={0.5}
          mobileScrollSupport={true}
          onFlip={(e: any) => setCurrentPage(e.data)}
          style={{}}
          className=""
          startPage={0}
          minWidth={400}
          maxWidth={400}
          minHeight={500}
          maxHeight={500}
          drawShadow={true}
          flippingTime={800}
          usePortrait={true}
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

      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginTop: '1.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          aria-label="Previous page"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', color: '#FFD700',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,215,0,0.2)';
            e.currentTarget.style.borderColor = '#FFD700';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
        >
          &#8249;
        </button>

        <span style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.85rem',
          fontFamily: FONT_UI,
          fontWeight: 600,
          minWidth: 60,
          textAlign: 'center',
        }}>
          {currentPage + 1} / {totalBookPages}
        </span>

        <button
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          aria-label="Next page"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', color: '#FFD700',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,215,0,0.2)';
            e.currentTarget.style.borderColor = '#FFD700';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
        >
          &#8250;
        </button>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '0.8rem',
        marginTop: '1.2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.6rem 1.8rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: FONT_UI,
            borderRadius: 50,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#FFD700';
            e.currentTarget.style.color = '#FFD700';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          Create Another Book
        </button>
      </div>
    </div>
  );
}
