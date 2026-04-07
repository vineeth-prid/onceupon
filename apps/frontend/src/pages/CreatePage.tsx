import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, BOOK_TEMPLATES } from '@bookmagic/shared';

export function CreatePage() {
  const navigate = useNavigate();
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [storyMode, setStoryMode] = useState<'select' | 'template' | 'custom'>('select');
  const [customPrompt, setCustomPrompt] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* How It Works */}
      <section style={{ padding: '3rem 2rem 2rem', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: "'Instrument Serif', serif",
          fontSize: '2rem',
          fontWeight: 400,
          color: '#000',
          marginBottom: '2rem',
        }}>
          How It Works
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { step: '1', icon: '\uD83D\uDCDA', title: 'Choose Your Story', desc: 'Pick a template or create your own' },
            { step: '2', icon: '\uD83D\uDCF7', title: 'Upload a Photo', desc: 'Add your child\'s photo' },
            { step: '3', icon: '\u2728', title: 'AI Creates Magic', desc: 'Story & illustrations generated' },
            { step: '4', icon: '\uD83D\uDCD6', title: 'Read & Enjoy', desc: 'Flip through your book' },
          ].map((item) => (
            <div key={item.step} style={{
              textAlign: 'center',
              flex: '1 1 180px',
              maxWidth: 200,
            }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8D5F5, #D5E8F5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.8rem',
                fontSize: '1.8rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: '#000',
                margin: '0 0 0.3rem',
              }}>{item.title}</h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                color: '#6F6F6F',
                margin: 0,
              }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Mode Section */}
      <section id="categories" style={{
        padding: '2rem 2rem 3rem',
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        {/* Story Mode Selector */}
        {storyMode === 'select' && (
          <>
            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Instrument Serif', serif",
              fontSize: '2rem',
              fontWeight: 400,
              color: '#000',
              marginBottom: '0.5rem',
            }}>
              Choose Your Story
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#6F6F6F',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '2.5rem',
              fontSize: '1rem',
            }}>
              Pick a pre-made template or create something entirely your own
            </p>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {/* Template Stories Card */}
              <div
                onClick={() => setStoryMode('template')}
                onMouseEnter={() => setHoveredCard('template')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flex: '1 1 280px',
                  maxWidth: 440,
                  background: hoveredCard === 'template'
                    ? 'linear-gradient(135deg, #E8D5F5 0%, #D5E8F5 100%)'
                    : 'linear-gradient(135deg, #F3EAF9 0%, #EAF1FA 100%)',
                  borderRadius: 24,
                  padding: '2.5rem 2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: hoveredCard === 'template' ? '2px solid #AB47BC' : '2px solid transparent',
                  transform: hoveredCard === 'template' ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hoveredCard === 'template'
                    ? '0 12px 35px rgba(171, 71, 188, 0.2)'
                    : '0 4px 15px rgba(0, 0, 0, 0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.2rem',
                  fontSize: '2.2rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
                }}>
                  {'\uD83D\uDCDA'}
                </div>
                <h3 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#000',
                  margin: '0 0 0.5rem',
                }}>
                  Template Stories
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  color: '#6F6F6F',
                  margin: '0 0 1.2rem',
                  lineHeight: 1.5,
                }}>
                  Browse our collection of pre-made story themes across {CATEGORIES.length} categories
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.2rem',
                  borderRadius: 50,
                  background: hoveredCard === 'template' ? '#AB47BC' : 'rgba(171, 71, 188, 0.12)',
                  color: hoveredCard === 'template' ? '#fff' : '#AB47BC',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease',
                }}>
                  Browse Templates &#8594;
                </div>
              </div>

              {/* Custom Story Card */}
              <div
                onClick={() => setStoryMode('custom')}
                onMouseEnter={() => setHoveredCard('custom')}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flex: '1 1 280px',
                  maxWidth: 440,
                  background: hoveredCard === 'custom'
                    ? 'linear-gradient(135deg, #D5F5E3 0%, #D5E8F5 100%)'
                    : 'linear-gradient(135deg, #E8F8EE 0%, #EAF1FA 100%)',
                  borderRadius: 24,
                  padding: '2.5rem 2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: hoveredCard === 'custom' ? '2px solid #43A047' : '2px solid transparent',
                  transform: hoveredCard === 'custom' ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hoveredCard === 'custom'
                    ? '0 12px 35px rgba(67, 160, 71, 0.2)'
                    : '0 4px 15px rgba(0, 0, 0, 0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.2rem',
                  fontSize: '2.2rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
                }}>
                  {'\u2728'}
                </div>
                <h3 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#000',
                  margin: '0 0 0.5rem',
                }}>
                  Create Your Own Story
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  color: '#6F6F6F',
                  margin: '0 0 1.2rem',
                  lineHeight: 1.5,
                }}>
                  Describe your story idea and our AI will bring it to life as a storybook
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.2rem',
                  borderRadius: 50,
                  background: hoveredCard === 'custom' ? '#43A047' : 'rgba(67, 160, 71, 0.12)',
                  color: hoveredCard === 'custom' ? '#fff' : '#43A047',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease',
                }}>
                  Start Writing &#8594;
                </div>
              </div>
            </div>
          </>
        )}

        {/* Template Stories Mode */}
        {storyMode === 'template' && (
          <>
            <button
              onClick={() => { setStoryMode('select'); setExpandedCategory(null); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: '#6F6F6F',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: 0,
              }}
            >
              &#8592; Back to story options
            </button>

            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Instrument Serif', serif",
              fontSize: '2rem',
              fontWeight: 400,
              color: '#000',
              marginBottom: '0.5rem',
            }}>
              Choose a Category
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#6F6F6F',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '2rem',
              fontSize: '1rem',
            }}>
              Pick a genre, then choose your story
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {CATEGORIES.map((cat) => {
                const isExpanded = expandedCategory === cat.id;
                const isHovered = hoveredCategory === cat.id;
                const books = BOOK_TEMPLATES.filter((t) => t.categoryId === cat.id && t.id !== 'custom');

                return (
                  <div key={cat.id}>
                    <div
                      onClick={() => handleCategoryClick(cat.id)}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{
                        background: isExpanded
                          ? `linear-gradient(135deg, ${cat.color}20 0%, ${cat.color}10 100%)`
                          : '#fff',
                        borderRadius: isExpanded ? '20px 20px 0 0' : 20,
                        padding: '1.2rem 1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${isExpanded || isHovered ? cat.color : '#eee'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: isHovered ? `0 4px 15px ${cat.color}20` : '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `${cat.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.6rem',
                        flexShrink: 0,
                      }}>
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          color: '#000',
                          margin: 0,
                        }}>
                          {cat.name}
                        </h3>
                        <p style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.85rem',
                          color: '#6F6F6F',
                          margin: '0.15rem 0 0',
                        }}>
                          {cat.description}
                        </p>
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#aaa',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}>
                        {books.length} books
                        <span style={{
                          display: 'inline-block',
                          transition: 'transform 0.3s',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}>
                          &#9660;
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        border: `2px solid ${cat.color}`,
                        borderTop: 'none',
                        borderRadius: '0 0 20px 20px',
                        padding: '1.2rem',
                        background: `linear-gradient(180deg, ${cat.color}08 0%, #fff 100%)`,
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: '1rem',
                        }}>
                          {books.map((book) => {
                            const isBookHovered = hoveredBook === book.id;
                            return (
                              <div
                                key={book.id}
                                onClick={() => navigate(`/personalize/${book.id}`)}
                                onMouseEnter={() => setHoveredBook(book.id)}
                                onMouseLeave={() => setHoveredBook(null)}
                                style={{
                                  background: '#fff',
                                  borderRadius: 16,
                                  padding: '1.2rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease',
                                  border: `2px solid ${isBookHovered ? cat.color : '#f0f0f0'}`,
                                  transform: isBookHovered ? 'translateY(-4px)' : 'translateY(0)',
                                  boxShadow: isBookHovered
                                    ? `0 8px 25px ${cat.color}25`
                                    : '0 2px 8px rgba(0,0,0,0.04)',
                                }}
                              >
                                <h4 style={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontSize: '1.05rem',
                                  fontWeight: 600,
                                  color: '#000',
                                  margin: '0 0 0.3rem',
                                }}>
                                  {book.name}
                                </h4>
                                <p style={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontSize: '0.82rem',
                                  color: '#6F6F6F',
                                  margin: '0 0 0.8rem',
                                  lineHeight: 1.4,
                                }}>
                                  {book.description}
                                </p>
                                <div style={{
                                  display: 'inline-block',
                                  padding: '0.35rem 1rem',
                                  borderRadius: 50,
                                  background: isBookHovered ? cat.color : `${cat.color}15`,
                                  color: isBookHovered ? '#fff' : cat.color,
                                  fontFamily: "'Inter', sans-serif",
                                  fontWeight: 600,
                                  fontSize: '0.78rem',
                                  transition: 'all 0.25s ease',
                                }}>
                                  Create Book
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Custom Story Mode */}
        {storyMode === 'custom' && (
          <>
            <button
              onClick={() => setStoryMode('select')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: '#6F6F6F',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: 0,
              }}
            >
              &#8592; Back to story options
            </button>

            <div style={{
              maxWidth: 640,
              margin: '0 auto',
            }}>
              <h2 style={{
                textAlign: 'center',
                fontFamily: "'Instrument Serif', serif",
                fontSize: '2rem',
                fontWeight: 400,
                color: '#000',
                marginBottom: '0.5rem',
              }}>
                Create Your Own Story
              </h2>
              <p style={{
                textAlign: 'center',
                color: '#6F6F6F',
                fontFamily: "'Inter', sans-serif",
                marginBottom: '2rem',
                fontSize: '1rem',
              }}>
                Describe the story you'd like us to create for your child
              </p>

              <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.6rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  color: '#000',
                  fontSize: '0.95rem',
                }}>
                  Your Story Idea
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  maxLength={2000}
                  placeholder="e.g., A story about my child visiting their grandmother in Kerala, where they discover a magical garden with talking animals and learn about kindness..."
                  style={{
                    width: '100%',
                    minHeight: 160,
                    padding: '1rem',
                    borderRadius: 16,
                    border: '2px solid #eee',
                    fontSize: '0.95rem',
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    lineHeight: 1.6,
                    color: '#333',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#43A047'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#eee'}
                />
                <div style={{
                  textAlign: 'right',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  color: customPrompt.length > 1800 ? '#D32F2F' : '#aaa',
                  marginTop: '0.4rem',
                  marginBottom: '1.2rem',
                }}>
                  {customPrompt.length} / 2000
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.82rem',
                    color: '#999',
                    margin: '0 0 0.6rem',
                  }}>
                    Need inspiration? Try one of these:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {[
                      'A bedtime adventure on the moon',
                      'Learning to ride a bicycle',
                      'A magical trip to the ocean',
                      'Making friends at a new school',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setCustomPrompt(suggestion)}
                        style={{
                          background: '#f5f5f5',
                          border: '1px solid #e8e8e8',
                          borderRadius: 50,
                          padding: '0.4rem 0.9rem',
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.78rem',
                          color: '#666',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#43A04715';
                          e.currentTarget.style.borderColor = '#43A047';
                          e.currentTarget.style.color = '#43A047';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f5f5f5';
                          e.currentTarget.style.borderColor = '#e8e8e8';
                          e.currentTarget.style.color = '#666';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/personalize/custom', { state: { customStoryPrompt: customPrompt } })}
                  disabled={customPrompt.trim().length < 10}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    background: customPrompt.trim().length < 10
                      ? '#ccc'
                      : 'linear-gradient(135deg, #43A047, #66BB6A)',
                    border: 'none',
                    borderRadius: 14,
                    cursor: customPrompt.trim().length < 10 ? 'not-allowed' : 'pointer',
                    color: '#fff',
                    boxShadow: customPrompt.trim().length < 10 ? 'none' : '0 4px 15px rgba(67, 160, 71, 0.3)',
                    transition: 'all 0.2s',
                    letterSpacing: '0.3px',
                  }}
                >
                  Continue to Personalize &#8594;
                </button>
              </div>
            </div>
          </>
        )}
      </section>

    </div>
  );
}
