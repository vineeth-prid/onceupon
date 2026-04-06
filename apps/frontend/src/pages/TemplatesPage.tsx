import { useState } from 'react';
import { Link } from 'react-router-dom';

const templates = [
  { id: 'babys-first-year', name: "Baby's First Year", emoji: '\u{1F476}', category: 'children', tag: 'Children \u00B7 Milestone', desc: 'Capture every precious first \u2014 first smile, first step, first word \u2014 in a beautifully illustrated storybook.', price: '\u20B93,999', gradient: 'linear-gradient(148deg, #d4aa6a, #8a5a28, #3a1e0e)' },
  { id: 'wedding-story', name: 'Wedding Story', emoji: '\u{1F48D}', category: 'love', tag: 'Love \u00B7 Wedding', desc: 'Relive your perfect day from proposal to first dance in a romantic, illustrated keepsake.', price: '$59', gradient: 'linear-gradient(148deg, #e0a898, #c46858, #621c14)' },
  { id: 'pregnancy-journey', name: 'Pregnancy Journey', emoji: '\u{1F930}', category: 'love', tag: 'Love \u00B7 Pregnancy', desc: 'Document nine magical months \u2014 the anticipation, the milestones, and the wonder of welcoming new life.', price: '$54', gradient: 'linear-gradient(148deg, #a0c0a4, #437048, #1c3820)' },
  { id: 'new-home', name: 'New Home Story', emoji: '\u{1F3E0}', category: 'life', tag: 'Life \u00B7 Milestone', desc: 'Celebrate the start of a new chapter with a beautifully crafted book about your new home.', price: '$44', gradient: 'linear-gradient(148deg, #a8bcd4, #4e6e90, #0c1e30)' },
  { id: 'our-love-story', name: 'Our Love Story', emoji: '\u{1F491}', category: 'love', tag: 'Love \u00B7 Anniversary', desc: 'From your first hello to where you are now \u2014 a personalised story of your unique journey together.', price: '$54', gradient: 'linear-gradient(148deg, #d4aa6a, #8a5a28, #3a1e0e)' },
  { id: 'travel-memories', name: 'Travel Memories', emoji: '\u2708\uFE0F', category: 'life', tag: 'Life \u00B7 Adventure', desc: 'Turn your travel photos into a beautifully illustrated adventure book that brings your journeys to life.', price: '$49', gradient: 'linear-gradient(148deg, #88b48a, #3e7246, #1b3c22)' },
  { id: 'growing-up', name: 'Growing Up', emoji: '\u{1F9D2}', category: 'children', tag: 'Children \u00B7 Milestone', desc: 'A year-by-year celebration of your child growing \u2014 personality, memories, and milestones captured.', price: '$49', gradient: 'linear-gradient(148deg, #e0a898, #c46858, #621c14)' },
  { id: 'graduation', name: 'Graduation Story', emoji: '\u{1F393}', category: 'life', tag: 'Life \u00B7 Achievement', desc: 'Celebrate the end of one chapter and the beginning of another with a personalised graduation book.', price: '$44', gradient: 'linear-gradient(148deg, #a8bcd4, #4e6e90, #0c1e30)' },
  { id: 'family-bonds', name: 'Family Bonds', emoji: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', category: 'love', tag: 'Love \u00B7 Family', desc: 'Celebrate the unique story of your family \u2014 the moments, the laughs, and the love that holds you together.', price: '$54', gradient: 'linear-gradient(148deg, #88b48a, #3e7246, #1b3c22)' },
];

type Category = 'all' | 'children' | 'love' | 'life';
type SortOption = 'popular' | 'newest' | 'price-low';

const filterOptions: { label: string; value: Category }[] = [
  { label: 'All Occasions', value: 'all' },
  { label: 'Children', value: 'children' },
  { label: 'Love & Family', value: 'love' },
  { label: 'Life Milestones', value: 'life' },
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price Low-High', value: 'price-low' },
];

export function TemplatesPage() {
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [sort, setSort] = useState<SortOption>('popular');

  const filtered = templates.filter(
    (t) => activeFilter === 'all' || t.category === activeFilter,
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-low') {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return priceA - priceB;
    }
    return 0;
  });

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
          style={{
            fontSize: 14,
            color: '#6F6F6F',
            marginBottom: 32,
          }}
        >
          <Link to="/" style={{ color: '#6F6F6F', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#FFF' }}>Templates</span>
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
          Browse our collection of beautifully crafted templates and bring your
          story to life.
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
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className="font-body"
                style={{
                  padding: '8px 20px',
                  borderRadius: 999,
                  border:
                    activeFilter === opt.value
                      ? '1.5px solid #000'
                      : '1px solid #D0D0D0',
                  background: activeFilter === opt.value ? '#000' : '#FFF',
                  color: activeFilter === opt.value ? '#FFF' : '#000',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="font-body"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #D0D0D0',
              background: '#FFF',
              color: '#000',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Template Grid */}
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
          className="templates-grid"
        >
          {sorted.map((t) => (
            <div
              key={t.id}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #E5E5E5',
                background: '#FFF',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 8px 30px rgba(0,0,0,0.08)';
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
                  background: t.gradient,
                  padding: '40px 24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 12 }}>{t.emoji}</div>
                <h3
                  className="font-display"
                  style={{
                    color: '#FFF',
                    fontSize: 22,
                    fontWeight: 400,
                    margin: 0,
                  }}
                >
                  {t.name}
                </h3>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 24px 24px' }}>
                <span
                  className="font-body"
                  style={{
                    display: 'inline-block',
                    fontSize: 12,
                    color: '#6F6F6F',
                    background: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    borderRadius: 999,
                    padding: '4px 12px',
                    marginBottom: 12,
                  }}
                >
                  {t.tag}
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
                  {t.desc}
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
                    {t.price}
                  </span>
                  <Link
                    to="/create"
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
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '0.85';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '1';
                    }}
                  >
                    Use Template
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sorted.length === 0 && (
          <p
            className="font-body"
            style={{
              textAlign: 'center',
              color: '#6F6F6F',
              fontSize: 16,
              marginTop: 60,
            }}
          >
            No templates found for this category.
          </p>
        )}
      </section>

      {/* Responsive grid styles */}
      <style>{`
        @media (max-width: 900px) {
          .templates-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 580px) {
          .templates-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
