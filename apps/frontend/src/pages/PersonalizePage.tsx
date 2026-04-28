import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BOOK_TEMPLATES, CATEGORIES, ILLUSTRATION_STYLES, FAMILY_COMPATIBLE_STYLES } from '@bookmagic/shared';
import { uploadPhoto, createOrder, createFamilyOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { FamilyPhotoUploader, type FamilyMemberOutput } from '../components/FamilyPhotoUploader';

export function PersonalizePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const isCustom = bookId === 'custom';
  const customStoryPrompt = (location.state as any)?.customStoryPrompt || '';

  const book = BOOK_TEMPLATES.find((t) => t.id === bookId);
  const category = book ? CATEGORIES.find((c) => c.id === book.categoryId) : null;
  const accent = isCustom ? '#43A047' : (category?.color || '#9B59B6');

  // Mode toggle
  const [mode, setMode] = useState<'solo' | 'family'>('solo');

  // Solo mode state
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [childGender, setChildGender] = useState<'boy' | 'girl' | 'other'>('boy');
  const [illustrationStyle, setIllustrationStyle] = useState('disney-character');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Family mode state
  const [familyData, setFamilyData] = useState<{
    groupPhotoUrl: string;
    familyMembers: FamilyMemberOutput[];
    mainChildName: string;
    mainChildAge: number;
    mainChildGender: string;
  } | null>(null);

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

  // Filter styles for family mode
  const availableStyles = mode === 'family'
    ? ILLUSTRATION_STYLES.filter((s) => (FAMILY_COMPATIBLE_STYLES as readonly string[]).includes(s.id))
    : ILLUSTRATION_STYLES;

  // Reset to compatible style when switching to family mode
  useEffect(() => {
    if (mode === 'family' && !(FAMILY_COMPATIBLE_STYLES as readonly string[]).includes(illustrationStyle)) {
      setIllustrationStyle('disney-character');
    }
  }, [mode, illustrationStyle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'family') {
      // Family mode validation
      if (!familyData) { setError('Please upload a family photo and confirm members'); return; }
      if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address'); return; }

      setLoading(true);
      setError('');

      try {
        const order = await createFamilyOrder({
          childName: familyData.mainChildName,
          childAge: familyData.mainChildAge,
          childGender: (familyData.mainChildGender || 'other') as any,
          theme: bookId as any,
          illustrationStyle: illustrationStyle as any,
          photoUrl: familyData.familyMembers.find((m) => m.role === 'MAIN_CHILD')?.croppedPhotoUrl || '',
          email: email.trim(),
          ...(isCustom && customStoryPrompt ? { customStoryPrompt } : {}),
          familyMode: true as const,
          groupPhotoUrl: familyData.groupPhotoUrl,
          familyMembers: familyData.familyMembers,
        });
        navigate(`/progress/${order.id}`);
      } catch (err: any) {
        const responseData = err.response?.data;
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          const detail = responseData.errors.map((e: any) => e.message).join(', ');
          setError(`Validation failed: ${detail}`);
        } else {
          setError(responseData?.message || 'Something went wrong');
        }
        setLoading(false);
      }
    } else {
      // Solo mode (existing logic)
      if (!photo) { setError('Please upload a photo'); return; }
      if (!childName.trim()) { setError("Please enter your child's name"); return; }
      if (!email.trim() || !email.includes('@')) { setError("Please enter a valid email address"); return; }

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
          email: email.trim(),
        };
        if (isCustom && customStoryPrompt) {
          orderData.customStoryPrompt = customStoryPrompt;
        }
        const order = await createOrder(orderData);
        navigate(`/progress/${order.id}`);
      } catch (err: any) {
        const responseData = err.response?.data;
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          const detail = responseData.errors.map((e: any) => e.message).join(', ');
          setError(`Validation failed: ${detail}`);
        } else {
          setError(responseData?.message || 'Something went wrong');
        }
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
    }}>
      {/* How It Works Progress */}
      <section style={{ padding: '1rem 2rem 3rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { step: '1', icon: '\u270F\uFE0F', title: 'Describe Your Story', active: false },
            { step: '2', icon: '\uD83D\uDCF7', title: 'Upload a Photo', active: true },
            { step: '3', icon: '\u2728', title: 'AI Creates Magic', active: false },
            { step: '4', icon: '\uD83D\uDCD6', title: 'Read & Enjoy', active: false },
          ].map((item) => (
            <div key={item.step} style={{
              textAlign: 'center',
              flex: '1 1 140px',
              maxWidth: 160,
              opacity: item.active ? 1 : 0.4,
            }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: item.active ? 'linear-gradient(135deg, #D5F5E3, #D5E8F5)' : '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.6rem',
                fontSize: '1.4rem',
                boxShadow: item.active ? '0 4px 15px rgba(0, 0, 0, 0.06)' : 'none',
                border: item.active ? '2px solid #43A047' : 'none',
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '0.8rem',
                color: item.active ? '#000' : '#888',
                margin: 0,
              }}>{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <div style={{ width: '100%', maxWidth: 580 }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/create')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            color: '#999',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          &#8592; Back to story idea
        </button>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '2.4rem',
            fontWeight: 400,
            color: '#000',
            margin: '0 0 0.5rem',
          }}>
            Personalize Your Story
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            color: '#6F6F6F',
            margin: 0,
            fontSize: '1.05rem',
            lineHeight: 1.5,
          }}>
            {isCustom 
              ? `Creating illustrations for: "${customStoryPrompt.length > 60 ? customStoryPrompt.slice(0, 60) + '...' : customStoryPrompt}"`
              : `Personalizing: ${book?.name}`}
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
            {/* Solo / Family Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: '#000',
                fontSize: '0.95rem',
              }}>
                Story Type
              </label>
              <div style={{ display: 'flex', gap: '0.7rem' }}>
                {[
                  { value: 'solo' as const, label: 'Solo Story', desc: 'One child' },
                  { value: 'family' as const, label: 'Family Story', desc: '2-4 people' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      borderRadius: 12,
                      border: mode === opt.value ? `2px solid ${accent}` : '2px solid #eee',
                      background: mode === opt.value ? `${accent}15` : '#fff',
                      cursor: 'pointer',
                      fontFamily: "'Nunito', sans-serif",
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: mode === opt.value ? accent : '#555',
                    }}>
                      {opt.label}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#999',
                    }}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'family' ? (
              /* ─── Family Mode ─── */
              <div style={{ marginBottom: '1.5rem' }}>
                <FamilyPhotoUploader
                  accent={accent}
                  onFamilyData={(data) => {
                    setFamilyData(data);
                    setChildName(data.mainChildName);
                    setChildAge(data.mainChildAge);
                    setChildGender((data.mainChildGender || 'other') as any);
                  }}
                />
              </div>
            ) : (
              /* ─── Solo Mode ─── */
              <>
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
              </>
            )}

            {/* Email for Guest/Notification */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: '#000',
                fontSize: '0.95rem',
              }}>
                Your Email
              </label>
              <p style={{
                margin: '0 0 0.6rem',
                fontFamily: "'Inter', sans-serif",
                color: '#999',
                fontSize: '0.8rem',
              }}>
                We'll send the storybook to this address once it's ready
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  border: '2px solid #eee',
                  fontSize: '1rem',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = accent}
                onBlur={(e) => e.currentTarget.style.borderColor = '#eee'}
              />
            </div>

            {/* Illustration Style */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: '#000',
                fontSize: '0.95rem',
              }}>
                Illustration Style
              </label>
              <p style={{
                margin: '0 0 0.6rem',
                fontFamily: "'Inter', sans-serif",
                color: '#999',
                fontSize: '0.8rem',
              }}>
                {mode === 'family'
                  ? 'Family mode supports these styles (more coming soon)'
                  : "Choose the art style for your book's illustrations"}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.6rem',
              }}>
                {availableStyles.map((style) => {
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
                        fontFamily: "'Inter', sans-serif",
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

            {error && (
              <div style={{
                color: '#D32F2F',
                marginBottom: '1rem',
                padding: '0.7rem 1rem',
                background: '#FFEBEE',
                borderRadius: 12,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'family' && !familyData)}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                background: (loading || (mode === 'family' && !familyData)) ? '#ccc' : `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                border: 'none',
                borderRadius: 14,
                cursor: (loading || (mode === 'family' && !familyData)) ? 'not-allowed' : 'pointer',
                color: '#fff',
                boxShadow: loading ? 'none' : `0 4px 15px ${accent}40`,
                transition: 'all 0.2s',
                letterSpacing: '0.3px',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>&#9696;</span>
                  Generating preview...
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </span>
              ) : mode === 'family' ? (
                'Preview Family Book \u2728'
              ) : (
                <>Preview Book &#8594;</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
