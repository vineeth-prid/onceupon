import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { usePricing } from '../context/PricingContext';
import { formatINR } from '../utils/currency';

type Occasion = {
  id: string;
  title: string;
  tag: string;
  description: string;
  image: string;
  gradient: string;
};

const occasions: Occasion[] = [
  {
    id: 'wedding',
    title: 'Wedding & Anniversary',
    tag: 'Wedding',
    description: 'Turn your love story into a keepsake storybook — from the first meet to the big day.',
    image: '/occasions/wedding.jpg',
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
  },
  {
    id: 'first-born',
    title: 'Welcoming the First-Born',
    tag: 'Newborn',
    description: "Capture those magical first months — baby's arrival, tiny hands, and unforgettable moments.",
    image: '/occasions/first-born.jpg',
    gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
  },
  {
    id: 'graduation',
    title: 'Graduation Day',
    tag: 'Graduation',
    description: 'Celebrate the cap-and-gown moment with a personalised story of years of hard work.',
    image: '/occasions/graduation.jpg',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
  },
  {
    id: 'birthday',
    title: 'Birthday Celebration',
    tag: 'Birthday',
    description: "A custom storybook that makes the birthday star the hero of their own magical year.",
    image: '/occasions/birthday.jpg',
    gradient: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)',
  },
  {
    id: 'family-memories',
    title: 'Family Memories',
    tag: 'Family',
    description: 'Reunions, holidays, road trips — turn your favourite family chapters into a book.',
    image: '/occasions/family-memories.jpg',
    gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
  },
  {
    id: 'milestone',
    title: 'Life Milestones',
    tag: 'Milestone',
    description: 'New home, new job, retirement — every milestone deserves its own story.',
    image: '/occasions/milestone.jpg',
    gradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)',
  },
];

function OccasionImage({ src, gradient, alt }: { src: string; gradient: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <div style={{ width: '100%', height: '100%', background: gradient }} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function OccasionGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pricing } = usePricing();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section style={{ padding: '80px 0' }}>
      <style>{`
        .occasion-scroll::-webkit-scrollbar { display: none; }
        .occasion-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .occasion-card:hover { transform: translateY(-4px); }
        .occasion-card img { transition: transform 0.5s ease; }
        .occasion-card:hover img { transform: scale(1.05); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <p
              className="font-body"
              style={{
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#6F6F6F',
                marginBottom: 12,
              }}
            >
              Occasion Gallery
            </p>
            <h2
              className="font-display"
              style={{ fontSize: 40, fontWeight: 400, lineHeight: 1.2, color: '#000', margin: 0 }}
            >
              Every story has a{' '}
              <em style={{ color: '#6F6F6F' }}>perfect format</em>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <p
              className="font-body"
              style={{ fontSize: 13, color: '#6F6F6F', whiteSpace: 'nowrap', marginBottom: 0 }}
            >
              Scroll to explore
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => scroll('left')}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #E0E0E0',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                aria-label="Scroll left"
              >
                &larr;
              </button>
              <button
                onClick={() => scroll('right')}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #E0E0E0',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                aria-label="Scroll right"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="occasion-scroll"
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          paddingLeft: 'max(24px, calc((100vw - 1200px) / 2 + 24px))',
          paddingRight: 24,
          paddingBottom: 8,
          scrollbarWidth: 'none',
          alignItems: 'stretch',
        }}
      >
        {occasions.map((item) => (
          <Link
            to={`/create?occasion=${item.id}`}
            key={item.id}
            className="occasion-card liquid-glass"
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              width: 300,
              borderRadius: 20,
              overflow: 'hidden',
              textDecoration: 'none',
              color: 'inherit',
              height: 'auto',
            }}
          >
            <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
              <OccasionImage src={item.image} gradient={item.gradient} alt={item.title} />
            </div>

            <div style={{ padding: '20px 24px 24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <p
                className="font-body"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#6F6F6F',
                  marginBottom: 8,
                }}
              >
                {item.tag}
              </p>
              <h3
                className="font-display"
                style={{ fontSize: 22, fontWeight: 400, color: '#000', margin: '0 0 8px' }}
              >
                {item.title}
              </h3>
              <p
                className="font-body"
                style={{ fontSize: 14, lineHeight: 1.5, color: '#6F6F6F', margin: '0 0 16px', flexGrow: 1 }}
              >
                {item.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span
                  className="font-body"
                  style={{
                    display: 'inline-block',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#000',
                  }}
                >
                  Create Yours &rarr;
                </span>
                <span
                  className="font-body"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#374151',
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 999,
                    padding: '3px 10px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  From {formatINR(pricing.customStartingPrice)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
