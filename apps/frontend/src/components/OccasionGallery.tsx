import { Link } from 'react-router-dom';

const occasions = [
  {
    title: 'Super Boy and the Dragon',
    tag: 'Fantasy',
    description: 'A brave child befriends a lonely dragon in this heartwarming tale of courage.',
    image: '/thumbnails/super-boy-and-the-dragon.webp',
  },
  {
    title: 'Girl Saves the Arctic Kingdom',
    tag: 'Adventure',
    description: 'An icy adventure powered by care and courage to save the kingdom.',
    image: '/thumbnails/girl-saves-the-arctic-kingdom.webp',
  },
  {
    title: 'Girl and the Lost Fairy Wings',
    tag: 'Fantasy',
    description: 'A magical quest to find the legendary fairy wings in an enchanted realm.',
    image: '/thumbnails/girl-and-the-lost-fairy-wings.webp',
  },
  {
    title: 'The Boy and the Cosmic Journey',
    tag: 'Adventure',
    description: 'Blast off through stars, planets, and galaxies on an epic space adventure.',
    image: '/thumbnails/the-boy-and-the-cosmic-journey.webp',
  },
  {
    title: 'Vroom Vroom, The Boy Wins the Race',
    tag: 'Adventure',
    description: "A child's magical race to believe, try, and win against all odds.",
    image: '/thumbnails/vroom-vroom-the-boy-wins-the-race.webp',
  },
  {
    title: 'Boy Explores the Zoo',
    tag: 'Animals',
    description: 'A fun-filled day discovering amazing animals at the zoo.',
    image: '/thumbnails/boy-explores-the-zoo.webp',
  },
  {
    title: "The Portugal's New Legend",
    tag: 'Sports',
    description: 'For champions with red and green at heart — a legendary sports story.',
    image: '/thumbnails/the-portugals-new-legend.webp',
  },
  {
    title: 'The Boy Who Could Talk to Animals',
    tag: 'Animals',
    description: 'A magical gift that lets a child hear what animals truly have to say.',
    image: '/thumbnails/the-boy-who-could-talk-to-animals.webp',
  },
];

export default function OccasionGallery() {
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
          <p
            className="font-body hidden sm:block"
            style={{ fontSize: 13, color: '#6F6F6F', whiteSpace: 'nowrap', marginBottom: 4 }}
          >
            Scroll to explore &rarr;
          </p>
        </div>
      </div>

      <div
        className="occasion-scroll"
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          paddingLeft: 'max(24px, calc((100vw - 1200px) / 2 + 24px))',
          paddingRight: 24,
          paddingBottom: 8,
          scrollbarWidth: 'none',
        }}
      >
        {occasions.map((item) => (
          <div
            key={item.title}
            className="occasion-card liquid-glass"
            style={{
              flexShrink: 0,
              width: 300,
              borderRadius: 20,
              overflow: 'hidden',
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
            <div style={{ padding: '20px 24px 24px' }}>
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
                style={{ fontSize: 14, lineHeight: 1.5, color: '#6F6F6F', margin: '0 0 16px' }}
              >
                {item.description}
              </p>
              <Link
                to="/create"
                className="font-body"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#000',
                  textDecoration: 'none',
                }}
              >
                Create Yours &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
