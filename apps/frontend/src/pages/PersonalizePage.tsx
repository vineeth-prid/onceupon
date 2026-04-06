import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BOOK_TEMPLATES, CATEGORIES, ILLUSTRATION_STYLES } from '@bookmagic/shared';
import { uploadPhoto, createOrder } from '../api/orders';

export function PersonalizePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);

  const isCustom = bookId === 'custom';
  const customStoryPrompt = (location.state as any)?.customStoryPrompt || '';

  const book = BOOK_TEMPLATES.find((t) => t.id === bookId);
  const category = book ? CATEGORIES.find((c) => c.id === book.categoryId) : null;
  const accent = isCustom ? '#43A047' : (category?.color || '#9B59B6');

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [childGender, setChildGender] = useState<'boy' | 'girl' | 'other'>('boy');
  const [illustrationStyle, setIllustrationStyle] = useState('disney-character');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [bookFormat, setBookFormat] = useState('classic');
  const [dedication, setDedication] = useState('');
  const [language, setLanguage] = useState('English');
  const [occasion, setOccasion] = useState('Birthday');

  useEffect(() => {
    if (isCustom && !customStoryPrompt) {
      navigate('/create');
    }
  }, [isCustom, customStoryPrompt, navigate]);

  if (!isCustom && (!book || !category)) {
    return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: "'Nunito', sans-serif" }}>Book not found</div>;
  }

  const handleFile = (file: File) => {
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) { setError('Please upload a photo'); return; }
    if (!childName.trim()) { setError("Please enter your child's name"); return; }

    setLoading(true);
    setError('');

    try {
      const { url: photoUrl } = await uploadPhoto(photo);
      const orderData: any = {
        childName: childName.trim(),
        childAge,
        childGender,
        theme: bookId as any,
        illustrationStyle: illustrationStyle as any,
        photoUrl,
      };
      if (isCustom && customStoryPrompt) {
        orderData.customStoryPrompt = customStoryPrompt;
      }
      const order = await createOrder(orderData);
      navigate(`/progress/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF9F0',
      display: 'flex',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/create')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '0.9rem',
            color: '#888',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          &#8592; Back to categories
        </button>

        {/* Book header card */}
        <div style={{
          background: `linear-gradient(135deg, ${accent}25 0%, ${accent}10 100%)`,
          borderRadius: 20,
          padding: '1.8rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          border: `2px solid ${accent}30`,
        }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{isCustom ? '\u2728' : category!.icon}</div>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            color: accent,
            margin: '0 0 0.2rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {isCustom ? 'Custom Story' : category!.name}
          </p>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#2d1b69',
            margin: '0 0 0.3rem',
          }}>
            {isCustom ? 'Your Custom Story' : book!.name}
          </h1>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            color: '#666',
            margin: 0,
            fontSize: '0.95rem',
          }}>
            {isCustom
              ? (customStoryPrompt.length > 100 ? customStoryPrompt.slice(0, 100) + '...' : customStoryPrompt)
              : book!.description}
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Photo upload */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.6rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                color: '#2d1b69',
                fontSize: '0.95rem',
              }}>
                Upload Your Child's Photo
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {photoPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 16,
                      border: `3px solid ${accent}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      background: 'none',
                      border: `1px solid ${accent}`,
                      color: accent,
                      borderRadius: 10,
                      padding: '0.4rem 1rem',
                      cursor: 'pointer',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? accent : '#ddd'}`,
                    borderRadius: 16,
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? `${accent}10` : '#FAFAFA',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>&#128247;</div>
                  <p style={{
                    margin: 0,
                    fontFamily: "'Nunito', sans-serif",
                    color: '#999',
                    fontSize: '0.9rem',
                  }}>
                    Click or drag a photo here
                  </p>
                  <p style={{
                    margin: '0.3rem 0 0',
                    fontFamily: "'Nunito', sans-serif",
                    color: '#ccc',
                    fontSize: '0.75rem',
                  }}>
                    JPEG, PNG, or WebP (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                color: '#2d1b69',
                fontSize: '0.95rem',
              }}>
                Child's Name
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Aarav, Maya, Leo..."
                maxLength={50}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  border: '2px solid #eee',
                  fontSize: '1rem',
                  fontFamily: "'Nunito', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = accent}
                onBlur={(e) => e.currentTarget.style.borderColor = '#eee'}
              />
            </div>

            {/* Age */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                color: '#2d1b69',
                fontSize: '0.95rem',
              }}>
                Age
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setChildAge(age)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: childAge === age ? `2px solid ${accent}` : '2px solid #eee',
                      background: childAge === age ? `${accent}15` : '#fff',
                      color: childAge === age ? accent : '#666',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: childAge === age ? 700 : 600,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                color: '#2d1b69',
                fontSize: '0.95rem',
              }}>
                Gender
              </label>
              <div style={{ display: 'flex', gap: '0.7rem' }}>
                {[
                  { value: 'boy' as const, label: 'Boy', icon: '\uD83D\uDC66' },
                  { value: 'girl' as const, label: 'Girl', icon: '\uD83D\uDC67' },
                  { value: 'other' as const, label: 'Other', icon: '\u2B50' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setChildGender(g.value)}
                    style={{
                      flex: 1,
                      padding: '0.7rem',
                      borderRadius: 12,
                      border: childGender === g.value ? `2px solid ${accent}` : '2px solid #eee',
                      background: childGender === g.value ? `${accent}15` : '#fff',
                      cursor: 'pointer',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600,
                      color: childGender === g.value ? accent : '#666',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <span>{g.icon}</span> {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Illustration Style */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                color: '#2d1b69',
                fontSize: '0.95rem',
              }}>
                Illustration Style
              </label>
              <p style={{
                margin: '0 0 0.6rem',
                fontFamily: "'Nunito', sans-serif",
                color: '#999',
                fontSize: '0.8rem',
              }}>
                Choose the art style for your book's illustrations
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.6rem',
              }}>
                {ILLUSTRATION_STYLES.map((style) => {
                  const isSelected = illustrationStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setIllustrationStyle(style.id)}
                      style={{
                        padding: '0.7rem 0.5rem',
                        borderRadius: 14,
                        border: isSelected ? `2px solid ${accent}` : '2px solid #eee',
                        background: isSelected ? `${accent}12` : '#fff',
                        cursor: 'pointer',
                        fontFamily: "'Nunito', sans-serif",
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{style.icon}</span>
                      <span style={{
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: '0.78rem',
                        color: isSelected ? accent : '#555',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}>
                        {style.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Book Format */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.3rem', fontWeight: 400, color: '#000', marginBottom: '0.5rem' }}>
                Choose Book Format
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6F6F6F', marginBottom: '1rem' }}>
                Select the size and cover type for your book
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {[
                  { id: 'classic', name: 'Classic Square', desc: '21×21cm · 24 pages · Softcover', price: 'From ₹3,999' },
                  { id: 'premium', name: 'Premium Square', desc: '25×25cm · 32 pages · Hardcover', price: 'From ₹5,749' },
                  { id: 'grand', name: 'Grand Portrait', desc: '21×28cm · 40 pages · Hardcover', price: 'From ₹6,599' },
                ].map((fmt) => (
                  <div
                    key={fmt.id}
                    onClick={() => setBookFormat(fmt.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: 14,
                      border: bookFormat === fmt.id ? '2px solid #000' : '2px solid #eee',
                      background: bookFormat === fmt.id ? '#f8f8f8' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                      {fmt.id === 'classic' ? '📗' : fmt.id === 'premium' ? '📘' : '📙'}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#000', marginBottom: '0.2rem' }}>{fmt.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6F6F6F', marginBottom: '0.4rem' }}>{fmt.desc}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: accent }}>{fmt.price}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Story Details */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.3rem', fontWeight: 400, color: '#000', marginBottom: '0.5rem' }}>
                Story Details
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6F6F6F', marginBottom: '1rem' }}>
                Optional details to personalize your book further
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                    Personal Dedication (optional)
                  </label>
                  <textarea
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    placeholder="e.g. To Emma — may you always remember how loved you are."
                    rows={2}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #eee', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = '#eee')}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #eee', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                    >
                      {['English', 'Hindi', 'Arabic', 'French', 'Spanish', 'German', 'Tamil', 'Telugu', 'Bengali', 'Japanese', 'Chinese'].map(lang => (
                        <option key={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                      Occasion
                    </label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #eee', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                    >
                      {['Birthday', "Baby's First Year", 'Graduation', 'Just Because', 'New Sibling', 'Other'].map(occ => (
                        <option key={occ}>{occ}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div style={{
                color: '#D32F2F',
                marginBottom: '1rem',
                padding: '0.7rem 1rem',
                background: '#FFEBEE',
                borderRadius: 12,
                fontFamily: "'Nunito', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                background: loading ? '#ccc' : `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                border: 'none',
                borderRadius: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                color: '#fff',
                boxShadow: loading ? 'none' : `0 4px 15px ${accent}40`,
                transition: 'all 0.2s',
                letterSpacing: '0.3px',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>&#9696;</span>
                  Creating your book...
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </span>
              ) : (
                'Create My Storybook \u2728'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
