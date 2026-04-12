import { Link } from 'react-router-dom';

const occasions = [
  {
    title: 'Super Boy and the Dragon',
    tag: 'Adventure',
    description: 'A brave child befriends a lonely dragon in this heartwarming tale of courage.',
    image: '/thumbnails/super-boy-and-the-dragon.webp',
    gradient: 'linear-gradient(160deg, rgba(200,169,81,0.15), rgba(139,105,20,0.08))',
  },
  {
    title: 'Girl Saves the Arctic Kingdom',
    tag: 'Adventure',
    description: 'An icy adventure powered by care and courage to save the kingdom.',
    image: '/thumbnails/girl-saves-the-arctic-kingdom.webp',
    gradient: 'linear-gradient(160deg, rgba(59,130,246,0.12), rgba(30,58,95,0.06))',
  },
  {
    title: 'Princess and the Glowing Flower',
    tag: 'Fantasy',
    description: 'A magical quest to find the legendary glowing flower in the enchanted garden.',
    image: '/thumbnails/princess-and-the-glowing-flower.webp',
    gradient: 'linear-gradient(160deg, rgba(167,139,250,0.12), rgba(76,29,149,0.06))',
  },
  {
    title: 'Girl in Wonderland',
    tag: 'Fantasy',
    description: 'A whimsical journey through a world where anything is possible.',
    image: '/thumbnails/girl-in-wonderland.webp',
    gradient: 'linear-gradient(160deg, rgba(248,113,113,0.12), rgba(190,18,60,0.06))',
  },
  {
    title: 'The Boy and the Christmas Express',
    tag: 'Holidays',
    description: 'A festive adventure aboard the most magical train of the season.',
    image: '/thumbnails/the-boy-and-the-christmas-express.webp',
    gradient: 'linear-gradient(160deg, rgba(34,197,94,0.12), rgba(20,83,45,0.06))',
  },
  {
    title: 'Boy Explores the Zoo',
    tag: 'Animals',
    description: 'A fun-filled day discovering amazing animals at the zoo.',
    image: '/thumbnails/boy-explores-the-zoo.webp',
    gradient: 'linear-gradient(160deg, rgba(52,211,153,0.12), rgba(6,95,70,0.06))',
  },
  {
    title: "The Portugal's New Legend",
    tag: 'Sports',
    description: 'For champions with red and green at heart — a legendary sports story.',
    image: '/thumbnails/the-portugals-new-legend.webp',
    gradient: 'linear-gradient(160deg, rgba(245,158,11,0.12), rgba(146,64,14,0.06))',
  },
  {
    title: 'Happy Birthday Girl',
    tag: 'Birthday',
    description: 'The most special birthday celebration in a beautifully illustrated book.',
    image: '/thumbnails/happy-birthday-girl.webp',
    gradient: 'linear-gradient(160deg, rgba(148,163,184,0.12), rgba(71,85,105,0.06))',
  },
];

export default function OccasionGallery() {
  return (
    <section style={{ padding: '80px 0', background: '#fff' }}>
      <style>{`
        .occasion-scroll::-webkit-scrollbar { display: none; }
        .occasion-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .occasion-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important; }
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
            className="occasion-card"
            style={{
              flexShrink: 0,
              width: 300,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
            }}
          >
            {/* Image area */}
            <div
              style={{
                height: 220,
                overflow: 'hidden',
                position: 'relative',
                background: '#f5f5f5',
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
              {/* Subtle gradient overlay to soften image */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: item.gradient,
                pointerEvents: 'none',
              }} />
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
