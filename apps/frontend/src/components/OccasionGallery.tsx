import { Link } from 'react-router-dom';
import { useRef } from 'react';

const occasions = [
  {
    title: 'Super Boy and the Dragon',
    tag: 'Fantasy',
    description: 'A brave child befriends a lonely dragon in this heartwarming tale of courage.',
    image: '/thumbnails/super-boy-and-the-dragon.webp',
    id: 'super-dragon',
  },
  {
    title: 'Girl Saves the Arctic Kingdom',
    tag: 'Adventure',
    description: 'An icy adventure powered by care and courage to save the kingdom.',
    image: '/thumbnails/girl-saves-the-arctic-kingdom.webp',
    id: 'arctic-rescue',
  },
  {
    title: 'Girl and the Lost Fairy Wings',
    tag: 'Fantasy',
    description: 'A magical quest to find the legendary fairy wings in an enchanted realm.',
    image: '/thumbnails/girl-and-the-lost-fairy-wings.webp',
    id: 'lost-fairy-wings',
  },
  {
    title: 'The Boy and the Cosmic Journey',
    tag: 'Adventure',
    description: 'Blast off through stars, planets, and galaxies on an epic space adventure.',
    image: '/thumbnails/the-boy-and-the-cosmic-journey.webp',
    id: 'cosmic-journey',
  },
  {
    title: 'Vroom Vroom, The Boy Wins the Race',
    tag: 'Adventure',
    description: "A child's magical race to believe, try, and win against all odds.",
    image: '/thumbnails/vroom-vroom-the-boy-wins-the-race.webp',
    id: 'vroom-vroom-race',
  },
  {
    title: 'Boy Explores the Zoo',
    tag: 'Animals',
    description: 'A fun-filled day discovering amazing animals at the zoo.',
    image: '/thumbnails/boy-explores-the-zoo.webp',
    id: 'zoo-adventure-boy',
  },
  {
    title: "The Portugal's New Legend",
    tag: 'Sports',
    description: 'For champions with red and green at heart — a legendary sports story.',
    image: '/thumbnails/the-portugals-new-legend.webp',
    id: 'portugals-legend',
  },
  {
    title: 'The Boy Who Could Talk to Animals',
    tag: 'Animals',
    description: 'A magical gift that lets a child hear what animals truly have to say.',
    image: '/thumbnails/the-boy-who-could-talk-to-animals.webp',
    id: 'talk-to-animals',
  },
];

export default function OccasionGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320; // Approximate card width + gap
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
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
            to={`/books/${item.id}`}
            key={item.title}
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
            {/* Image area */}
            <div
              style={{
                height: 220,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Text area */}
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
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
