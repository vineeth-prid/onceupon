import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreatePage() {
  const navigate = useNavigate();
  const [customPrompt, setCustomPrompt] = useState('');

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
            { step: '1', icon: '\u270F\uFE0F', title: 'Describe Your Story', desc: 'Tell us your story idea' },
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
                background: 'linear-gradient(135deg, #D5F5E3, #D5E8F5)',
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

      {/* Custom Story Section */}
      <section style={{
        padding: '2rem 2rem 3rem',
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

          {/* Family Test Prompt */}
          <div style={{
            marginBottom: '1.2rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #E8F5E9, #F3E5F5)',
            borderRadius: 14,
            border: '1px solid #C8E6C9',
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#2E7D32',
              margin: '0 0 0.5rem',
            }}>
              Family Story (3 members — child + mother + father):
            </p>
            <button
              onClick={() => setCustomPrompt('A magical family adventure at an enchanted park. The father carries the child on his shoulders while the mother points at singing flowers. They discover a cloud playground, skip stones at a glowing lake, and walk through a firefly meadow at sunset. The father is a tall strong man and the mother is a graceful woman. The whole family dances together under the stars before heading home for a cozy bedtime.')}
              style={{
                background: 'linear-gradient(135deg, #43A047, #AB47BC)',
                border: 'none',
                borderRadius: 10,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#fff',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              Use Family Test Prompt
            </button>
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

        {/* Link to pre-made books */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            color: '#999',
            margin: '0 0 0.5rem',
          }}>
            Or browse our ready-made stories
          </p>
          <a
            href="/templates"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#AB47BC',
              textDecoration: 'none',
            }}
          >
            View Pre-made Books &#8594;
          </a>
        </div>
      </section>
    </div>
  );
}
