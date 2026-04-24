import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BOOK_CATALOG,
  CATALOG_CATEGORIES,
  type CatalogBook,
  type CatalogCategory,
} from '../data/bookCatalog';

type GenderFilter = 'all' | 'boy' | 'girl';

export function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CatalogCategory>('all');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');

  const filtered = useMemo(() => {
    let books: CatalogBook[] = BOOK_CATALOG;

    if (categoryFilter !== 'all') {
      books = books.filter((b) => b.category === categoryFilter);
    }
    if (genderFilter !== 'all') {
      books = books.filter((b) => b.gender === genderFilter || b.gender === 'neutral');
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.subtitle.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q),
      );
    }
    return books;
  }, [categoryFilter, genderFilter, search]);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* ─── Header ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>
        <nav
          className="font-body"
          style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}
        >
          <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: '#111', fontWeight: 600 }}>Books</span>
        </nav>

        <h1
          className="font-display"
          style={{
            color: '#111',
            fontSize: 44,
            fontWeight: 700,
            margin: '0 0 8px',
            lineHeight: 1.15,
          }}
        >
          Personalised Storybooks
        </h1>
        <p
          className="font-body"
          style={{
            color: '#6F6F6F',
            fontSize: 17,
            maxWidth: 420,
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          Crafted to spark imagination and lasting memories.
        </p>
      </section>

      {/* ─── Filter / Search Bar ──────────────────────────────── */}
      <section
        className="liquid-glass"
        style={{
          padding: '14px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderRadius: 0,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 280 }}>
            <svg
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 16,
                height: 16,
                color: '#999',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-body"
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                background: 'rgba(255,255,255,0.6)',
              }}
            />
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as GenderFilter)}
            className="font-body"
            style={{
              padding: '10px 14px',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 10,
              fontSize: 14,
              background: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              color: '#333',
            }}
          >
            <option value="all">Gender</option>
            <option value="boy">Boy</option>
            <option value="girl">Girl</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as 'all' | CatalogCategory)
            }
            className="font-body"
            style={{
              padding: '10px 14px',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 10,
              fontSize: 14,
              background: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              color: '#333',
            }}
          >
            <option value="all">All Categories</option>
            {CATALOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Result count */}
          <span
            className="font-body"
            style={{ fontSize: 13, color: '#999', marginLeft: 'auto' }}
          >
            {filtered.length} book{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* ─── Book Grid ────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div
          className="books-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32,
          }}
        >
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => navigate(`/books/${book.id}`)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            className="font-body"
            style={{
              textAlign: 'center',
              color: '#999',
              fontSize: 16,
              marginTop: 80,
            }}
          >
            No books match your search. Try a different filter.
          </p>
        )}

        {/* ─── CTA Banner ─────────────────────────────────────── */}
        <div
          className="liquid-glass-strong"
          style={{
            marginTop: 64,
            textAlign: 'center',
            padding: '48px 32px',
            borderRadius: 20,
          }}
        >
          <h3
            className="font-display"
            style={{ fontSize: 26, margin: '0 0 8px', color: '#111' }}
          >
            Don't see the perfect story?
          </h3>
          <p
            className="font-body"
            style={{ fontSize: 15, color: '#6b7280', margin: '0 0 24px' }}
          >
            Create a completely custom story with your own idea.
          </p>
          <Link
            to="/create"
            className="btn-primary inline-flex"
            style={{ padding: '14px 36px', textDecoration: 'none' }}
          >
            Create a Custom Story
          </Link>
        </div>
      </section>

      {/* ─── Responsive styles ────────────────────────────────── */}
      <style>{`
        .books-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 960px) {
          .books-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 580px) {
          .books-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Book Card Component ─────────────────────────────────────────────────── */

function BookCard({ book, onClick }: { book: CatalogBook; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const categoryColors: Record<string, string> = {
    Adventure: '#f97316',
    Fantasy: '#a855f7',
    Animals: '#22c55e',
    Sports: '#14b8a6',
  };

  const color = categoryColors[book.category] || '#6b7280';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="liquid-glass"
      style={{
        cursor: 'pointer',
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'transform 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
        }}
      >
        {!imgLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: '3px solid #e5e7eb',
                borderTopColor: '#999',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        )}
        <img
          src={book.thumbnail}
          alt={book.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            opacity: imgLoaded ? 1 : 0,
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 20px' }}>
        <h3
          className="font-display"
          style={{
            fontSize: 17,
            fontWeight: 600,
            margin: '0 0 4px',
            color: '#111',
            lineHeight: 1.3,
          }}
        >
          {book.title}
        </h3>
        <p
          className="font-body"
          style={{
            fontSize: 13,
            color: '#6b7280',
            margin: '0 0 12px',
            lineHeight: 1.5,
          }}
        >
          {book.subtitle}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span className="font-body" style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
            From {book.priceFormatted}
          </span>
          <span
            className="font-body"
            style={{
              fontSize: 11,
              color,
              background: `${color}14`,
              border: `1px solid ${color}30`,
              borderRadius: 999,
              padding: '3px 10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {book.category}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
