import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { THEMES } from '@bookmagic/shared';
import { uploadPhoto, createOrder } from '../api/orders';

const THEME_GRADIENTS: Record<string, string> = {
  'tooth-fairy': 'linear-gradient(135deg, #E8D5F5 0%, #F5E6FF 100%)',
  'dinosaur': 'linear-gradient(135deg, #C8F5D5 0%, #E6FFEC 100%)',
  'moon-princess': 'linear-gradient(135deg, #C4D9F5 0%, #E0EEFF 100%)',
};

const THEME_ACCENTS: Record<string, string> = {
  'tooth-fairy': '#9B59B6',
  'dinosaur': '#27AE60',
  'moon-princess': '#3498DB',
};

export function PersonalizePage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const theme = THEMES.find((t) => t.id === themeId);
  const fileRef = useRef<HTMLInputElement>(null);

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [childGender, setChildGender] = useState<'boy' | 'girl' | 'other'>('boy');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  if (!theme) {
    return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: "'Nunito', sans-serif" }}>Theme not found</div>;
  }

  const accent = THEME_ACCENTS[theme.id] || '#9B59B6';

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
      const order = await createOrder({
        childName: childName.trim(),
        childAge,
        childGender,
        theme: themeId as any,
        photoUrl,
      });
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
          onClick={() => navigate('/')}
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
          &#8592; Back to themes
        </button>

        {/* Theme header card */}
        <div style={{
          background: THEME_GRADIENTS[theme.id],
          borderRadius: 20,
          padding: '1.8rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#2d1b69',
            margin: '0 0 0.3rem',
          }}>
            {theme.name}
          </h1>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            color: '#666',
            margin: 0,
            fontSize: '0.95rem',
          }}>
            {theme.description}
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
            <div style={{ marginBottom: '2rem' }}>
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
