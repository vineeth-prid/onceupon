import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, BOOK_TEMPLATES, type CategoryId } from '@bookmagic/shared';

// Book-level display data (emoji, gradient, price) keyed by book template id
const bookDisplayData: Record<string, { emoji: string; gradient: string; price: string }> = {
  // Adventure
  'pirate-quest':    { emoji: '\u{1F3F4}\u200D\u2620\uFE0F', gradient: 'linear-gradient(148deg, #d4aa6a, #8a5a28, #3a1e0e)', price: '\u20B91,499' },
  'jungle-explorer': { emoji: '\u{1F334}',   gradient: 'linear-gradient(148deg, #88b48a, #3e7246, #1b3c22)', price: '\u20B91,499' },
  'space-mission':   { emoji: '\u{1F680}',   gradient: 'linear-gradient(148deg, #a8bcd4, #4e6e90, #0c1e30)', price: '\u20B91,499' },
  // Animals
  'puppy-rescue':    { emoji: '\u{1F436}',   gradient: 'linear-gradient(148deg, #e0a898, #c46858, #621c14)', price: '\u20B91,299' },
  'ocean-friends':   { emoji: '\u{1F42C}',   gradient: 'linear-gradient(148deg, #7ec8e3, #3a8bb0, #0a3d5c)', price: '\u20B91,299' },
  'safari-adventure':{ emoji: '\u{1F981}',   gradient: 'linear-gradient(148deg, #d4aa6a, #8a5a28, #3a1e0e)', price: '\u20B91,299' },
  // Education
  'learning-to-walk':{ emoji: '\u{1F6B6}',   gradient: 'linear-gradient(148deg, #a0c0a4, #437048, #1c3820)', price: '\u20B9999' },
  'first-words':     { emoji: '\u{1F4AC}',   gradient: 'linear-gradient(148deg, #b8a9d4, #6b4f9e, #2e1a5e)', price: '\u20B9999' },
  'alphabets':       { emoji: '\u{1F524}',   gradient: 'linear-gradient(148deg, #e8c170, #c08930, #5a3a10)', price: '\u20B9999' },
  'counting-fun':    { emoji: '\u{1F522}',   gradient: 'linear-gradient(148deg, #7ec8e3, #3a8bb0, #0a3d5c)', price: '\u20B9999' },
  // Fantasy
  'dragon-friend':   { emoji: '\u{1F409}',   gradient: 'linear-gradient(148deg, #e0a898, #c46858, #621c14)', price: '\u20B91,499' },
  'fairy-kingdom':   { emoji: '\u{1F9DA}',   gradient: 'linear-gradient(148deg, #d4a8d4, #8a4f8a, #3a1e3a)', price: '\u20B91,499' },
  'wizard-school':   { emoji: '\u{1F9D9}',   gradient: 'linear-gradient(148deg, #a8bcd4, #4e6e90, #0c1e30)', price: '\u20B91,499' },
  // Fiction
  'time-traveler':   { emoji: '\u{231A}',    gradient: 'linear-gradient(148deg, #d4aa6a, #8a5a28, #3a1e0e)', price: '\u20B91,299' },
  'tiny-giant':      { emoji: '\u{1F9D2}',   gradient: 'linear-gradient(148deg, #88b48a, #3e7246, #1b3c22)', price: '\u20B91,299' },
  'dream-world':     { emoji: '\u{1F30C}',   gradient: 'linear-gradient(148deg, #b8a9d4, #6b4f9e, #2e1a5e)', price: '\u20B91,299' },
  // Nurture
  'new-sibling':     { emoji: '\u{1F476}',   gradient: 'linear-gradient(148deg, #e0a898, #c46858, #621c14)', price: '\u20B91,199' },
  'first-day-school':{ emoji: '\u{1F392}',   gradient: 'linear-gradient(148deg, #a8bcd4, #4e6e90, #0c1e30)', price: '\u20B91,199' },
  'kindness-garden': { emoji: '\u{1F33B}',   gradient: 'linear-gradient(148deg, #a0c0a4, #437048, #1c3820)', price: '\u20B91,199' },
  // Cook
  'baking-day':      { emoji: '\u{1F382}',   gradient: 'linear-gradient(148deg, #e8c170, #c08930, #5a3a10)', price: '\u20B91,199' },
  'pizza-adventure': { emoji: '\u{1F355}',   gradient: 'linear-gradient(148deg, #e0a898, #c46858, #621c14)', price: '\u20B91,199' },
  'fruit-forest':    { emoji: '\u{1F353}',   gradient: 'linear-gradient(148deg, #88b48a, #3e7246, #1b3c22)', price: '\u20B91,199' },
};

type FilterValue = 'all' | CategoryId;

export function TemplatesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  const allBooks = BOOK_TEMPLATES.filter((t) => t.id !== 'custom');

  const filtered =
    activeFilter === 'all'
      ? allBooks
      : allBooks.filter((t) => t.categoryId === activeFilter);

  const getCategoryForBook = (categoryId: string) =>
    CATEGORIES.find((c) => c.id === categoryId);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          background: '#000',
          padding: '80px 24px 60px',
          textAlign: 'center',
        }}
      >
        <nav
          className="font-body"
          style={{ fontSize: 14, color: '#6F6F6F', marginBottom: 32 }}
        >
          <Link to="/" style={{ color: '#6F6F6F', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#FFF' }}>Pre-made Books</span>
        </nav>

        <h1
          className="font-display"
          style={{
            color: '#FFF',
            fontSize: 48,
            fontWeight: 400,
            margin: '0 0 16px',
            lineHeight: 1.2,
          }}
        >
          Find Your Perfect Story
        </h1>
        <p
          className="font-body"
          style={{
            color: '#6F6F6F',
            fontSize: 18,
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Browse our collection of beautifully crafted stories and bring your
          child's imagination to life.
        </p>
      </section>

      {/* Filter Bar */}
      <section
        style={{
          background: '#FAFAFA',
          borderBottom: '1px solid #E5E5E5',
          padding: '20px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFilter('all')}
              className="font-body"
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                border: activeFilter === 'all' ? '1.5px solid #000' : '1px solid #D0D0D0',
                background: activeFilter === 'all' ? '#000' : '#FFF',
                color: activeFilter === 'all' ? '#FFF' : '#000',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All Books
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className="font-body"
                style={{
                  padding: '8px 20px',
                  borderRadius: 999,
                  border:
                    activeFilter === cat.id
                      ? `1.5px solid ${cat.color}`
                      : '1px solid #D0D0D0',
                  background: activeFilter === cat.id ? cat.color : '#FFF',
                  color: activeFilter === cat.id ? '#FFF' : '#000',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Book Grid */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '48px 24px 80px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
          }}
          className="premade-grid"
        >
          {filtered.map((book) => {
            const display = bookDisplayData[book.id] || {
              emoji: '\u{1F4D6}',
              gradient: 'linear-gradient(148deg, #a8bcd4, #4e6e90, #0c1e30)',
              price: '\u20B91,299',
            };
            const cat = getCategoryForBook(book.categoryId);

            return (
              <div
                key={book.id}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid #E5E5E5',
                  background: '#FFF',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/personalize/${book.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Cover */}
                <div
                  style={{
                    background: display.gradient,
                    padding: '40px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 56, marginBottom: 12 }}>{display.emoji}</div>
                  <h3
                    className="font-display"
                    style={{
                      color: '#FFF',
                      fontSize: 22,
                      fontWeight: 400,
                      margin: 0,
                    }}
                  >
                    {book.name}
                  </h3>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <span
                    className="font-body"
                    style={{
                      display: 'inline-block',
                      fontSize: 12,
                      color: cat ? cat.color : '#6F6F6F',
                      background: cat ? `${cat.color}12` : '#FAFAFA',
                      border: `1px solid ${cat ? `${cat.color}30` : '#E5E5E5'}`,
                      borderRadius: 999,
                      padding: '4px 12px',
                      marginBottom: 12,
                      fontWeight: 600,
                    }}
                  >
                    {cat?.icon} {cat?.name}
                  </span>
                  <p
                    className="font-body"
                    style={{
                      fontSize: 14,
                      color: '#6F6F6F',
                      lineHeight: 1.6,
                      margin: '0 0 20px',
                    }}
                  >
                    {book.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      className="font-display"
                      style={{ fontSize: 20, color: '#000' }}
                    >
                      {display.price}
                    </span>
                    <span
                      className="font-body"
                      style={{
                        padding: '10px 24px',
                        borderRadius: 999,
                        background: '#000',
                        color: '#FFF',
                        fontSize: 14,
                        textDecoration: 'none',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      Create Book
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p
            className="font-body"
            style={{
              textAlign: 'center',
              color: '#6F6F6F',
              fontSize: 16,
              marginTop: 60,
            }}
          >
            No books found for this category.
          </p>
        )}

        {/* CTA to custom story */}
        <div
          style={{
            marginTop: 60,
            textAlign: 'center',
            padding: '2.5rem 2rem',
            background: 'linear-gradient(135deg, #E8F8EE 0%, #EAF1FA 100%)',
            borderRadius: 20,
          }}
        >
          <p
            className="font-body"
            style={{ fontSize: 16, color: '#6F6F6F', margin: '0 0 1rem' }}
          >
            Can't find what you're looking for?
          </p>
          <Link
            to="/create"
            className="font-body"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              borderRadius: 999,
              background: '#000',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
            }}
          >
            Create a Custom Story
          </Link>
        </div>
      </section>

      {/* Responsive grid styles */}
      <style>{`
        @media (max-width: 900px) {
          .premade-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 580px) {
          .premade-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
