import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEMES } from '@bookmagic/shared';
import { getAllOrders } from '../api/orders';

const THEME_ICONS: Record<string, string> = {
  'tooth-fairy': '\uD83E\uDDF7',
  'dinosaur': '\uD83E\uDD95',
  'moon-princess': '\uD83C\uDF19',
};

const THEME_GRADIENTS: Record<string, string> = {
  'tooth-fairy': 'linear-gradient(135deg, #E8D5F5 0%, #F5E6FF 50%, #DEC4F0 100%)',
  'dinosaur': 'linear-gradient(135deg, #C8F5D5 0%, #E6FFEC 50%, #B5E8C3 100%)',
  'moon-princess': 'linear-gradient(135deg, #C4D9F5 0%, #E0EEFF 50%, #B5CCE8 100%)',
};

const THEME_ACCENTS: Record<string, string> = {
  'tooth-fairy': '#9B59B6',
  'dinosaur': '#27AE60',
  'moon-princess': '#3498DB',
};

export function LandingPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  useEffect(() => {
    getAllOrders().then((data) => {
      setOrders(data.orders || []);
    }).catch(() => {});
  }, []);

  const completedOrders = orders.filter((o: any) =>
    o.pages && o.pages.length > 0 && o.pages.some((p: any) => p.imageUrl)
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 30%, #4a1a8a 60%, #2d1b69 100%)',
        padding: '4rem 2rem 5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating stars background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 4 + Math.random() * 4,
              height: 4 + Math.random() * 4,
              borderRadius: '50%',
              background: 'rgba(255,215,0,0.4)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }} />
          ))}
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes floatUp {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: '1.3rem',
            color: '#FFD700',
            marginBottom: '0.5rem',
            animation: 'floatUp 3s ease-in-out infinite',
          }}>
            Where imagination comes to life
          </p>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 1rem',
            lineHeight: 1.2,
          }}>
            Create Magical Storybooks{' '}
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF6347, #FFD700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              Starring Your Child
            </span>
          </h1>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '1.15rem',
            color: 'rgba(255,255,255,0.75)',
            maxWidth: 550,
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}>
            Transform your little one into the hero of their very own
            personalized illustrated storybook
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const el = document.getElementById('themes');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '0.9rem 2.2rem',
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                borderRadius: 50,
                cursor: 'pointer',
                color: '#1a0533',
                boxShadow: '0 4px 20px rgba(255,165,0,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(255,165,0,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,165,0,0.4)';
              }}
            >
              Create a Book
            </button>
            {completedOrders.length > 0 && (
              <button
                onClick={() => {
                  const el = document.getElementById('my-books');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: '0.9rem 2.2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",
                  background: 'transparent',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: 50,
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFD700';
                  e.currentTarget.style.color = '#FFD700';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                View My Books
              </button>
            )}
          </div>
        </div>

        {/* Wave bottom */}
        <svg viewBox="0 0 1440 120" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%' }}>
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,60 1440,60 L1440,120 L0,120 Z"
            fill="#FFF9F0"
          />
        </svg>
      </section>

      {/* How It Works */}
      <section style={{ padding: '3rem 2rem 2rem', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: "'Baloo 2', cursive",
          fontSize: '1.8rem',
          fontWeight: 800,
          color: '#2d1b69',
          marginBottom: '2rem',
        }}>
          How It Works
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { step: '1', icon: '\uD83D\uDCDA', title: 'Pick a Theme', desc: 'Choose from magical adventures' },
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
                boxShadow: '0 4px 15px rgba(45, 27, 105, 0.1)',
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                color: '#2d1b69',
                margin: '0 0 0.3rem',
              }}>{item.title}</h3>
              <p style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '0.85rem',
                color: '#888',
                margin: 0,
              }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Theme Selection */}
      <section id="themes" style={{
        padding: '2rem 2rem 3rem',
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: "'Baloo 2', cursive",
          fontSize: '1.8rem',
          fontWeight: 800,
          color: '#2d1b69',
          marginBottom: '0.5rem',
        }}>
          Choose Your Adventure
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#888',
          fontFamily: "'Nunito', sans-serif",
          marginBottom: '2rem',
          fontSize: '1rem',
        }}>
          Each theme creates a unique personalized storybook
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {THEMES.map((theme) => {
            const isHovered = hoveredTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => navigate(`/personalize/${theme.id}`)}
                onMouseEnter={() => setHoveredTheme(theme.id)}
                onMouseLeave={() => setHoveredTheme(null)}
                style={{
                  background: THEME_GRADIENTS[theme.id] || theme.coverColor,
                  borderRadius: 20,
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  border: `2px solid ${isHovered ? THEME_ACCENTS[theme.id] : 'transparent'}`,
                  transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered
                    ? `0 20px 40px rgba(0,0,0,0.15), 0 0 0 2px ${THEME_ACCENTS[theme.id]}20`
                    : '0 4px 15px rgba(0,0,0,0.06)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  animation: isHovered ? 'floatUp 2s ease-in-out infinite' : 'none',
                }}>
                  {THEME_ICONS[theme.id] || '\uD83D\uDCD6'}
                </div>
                <h2 style={{
                  margin: '0 0 0.5rem',
                  fontSize: '1.3rem',
                  fontFamily: "'Baloo 2', cursive",
                  fontWeight: 700,
                  color: '#2d1b69',
                }}>
                  {theme.name}
                </h2>
                <p style={{
                  margin: '0 0 1.2rem',
                  color: '#666',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}>
                  {theme.description}
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '0.5rem 1.5rem',
                  borderRadius: 50,
                  background: isHovered ? THEME_ACCENTS[theme.id] : 'rgba(255,255,255,0.7)',
                  color: isHovered ? '#fff' : THEME_ACCENTS[theme.id],
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease',
                }}>
                  Personalise Now
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* My Books Section */}
      {completedOrders.length > 0 && (
        <section id="my-books" style={{
          padding: '3rem 2rem 4rem',
          background: 'linear-gradient(180deg, #FFF9F0 0%, #F0E6FF 100%)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{
              textAlign: 'center',
              fontFamily: "'Baloo 2', cursive",
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#2d1b69',
              marginBottom: '0.5rem',
            }}>
              My Storybooks
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#888',
              fontFamily: "'Nunito', sans-serif",
              marginBottom: '2rem',
              fontSize: '1rem',
            }}>
              {completedOrders.length} book{completedOrders.length !== 1 ? 's' : ''} created
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}>
              {completedOrders.map((order: any) => {
                const coverImage = order.pages?.find((p: any) => p.imageUrl)?.imageUrl;
                const isHovered = hoveredBook === order.id;
                const themeAccent = THEME_ACCENTS[order.theme] || '#9B59B6';
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/preview/${order.id}`)}
                    onMouseEnter={() => setHoveredBook(order.id)}
                    onMouseLeave={() => setHoveredBook(null)}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      transform: isHovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
                      boxShadow: isHovered
                        ? '0 16px 40px rgba(0,0,0,0.18)'
                        : '0 4px 16px rgba(0,0,0,0.08)',
                      background: '#fff',
                    }}
                  >
                    {/* Book cover image */}
                    <div style={{
                      width: '100%',
                      height: 200,
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={order.childName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: THEME_GRADIENTS[order.theme] || '#E8D5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                        }}>
                          {THEME_ICONS[order.theme] || '\uD83D\uDCD6'}
                        </div>
                      )}
                      {/* Theme badge */}
                      <div style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: themeAccent,
                        color: '#fff',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: "'Nunito', sans-serif",
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}>
                        {THEMES.find(t => t.id === order.theme)?.name?.split(' ').slice(0, 2).join(' ') || order.theme}
                      </div>
                    </div>
                    {/* Book info */}
                    <div style={{ padding: '1rem 1.2rem' }}>
                      <h3 style={{
                        fontFamily: "'Baloo 2', cursive",
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#2d1b69',
                        margin: '0 0 0.3rem',
                      }}>
                        {order.storyJson?.title || `${order.childName}'s Adventure`}
                      </h3>
                      <p style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: '0.8rem',
                        color: '#999',
                        margin: '0 0 0.6rem',
                      }}>
                        For {order.childName} &middot; {order.pages?.length || 0} pages
                      </p>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.3rem 1rem',
                        borderRadius: 50,
                        background: isHovered ? themeAccent : '#f0e6ff',
                        color: isHovered ? '#fff' : themeAccent,
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        transition: 'all 0.3s ease',
                      }}>
                        Read Book
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#1a0533',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: "'Nunito', sans-serif",
        fontSize: '0.85rem',
      }}>
        <span style={{
          fontFamily: "'Dancing Script', cursive",
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.1rem',
          marginRight: '0.5rem',
        }}>Once Upon a Time</span>
        &middot; Personalized storybooks powered by AI
      </footer>
    </div>
  );
}
