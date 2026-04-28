import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    id: 'choose',
    label: '1. Choose a Book',
    icon: '📚',
    title: 'Pick Your Story Theme',
    description: 'Browse 9+ magical themes — from space adventures to fairy tales.',
  },
  {
    id: 'upload',
    label: '2. Upload a Photo',
    icon: '📷',
    title: 'Upload Your Child\'s Photo',
    description: 'Simply drag & drop or tap to upload. We use AI to make them the hero.',
  },
  {
    id: 'personalize',
    label: '3. Personalize',
    icon: '✏️',
    title: 'Add Their Name & Details',
    description: 'Enter the child\'s name, age, and choose an illustration style.',
  },
  {
    id: 'ai',
    label: '4. AI Creates Magic',
    icon: '✨',
    title: 'AI Generates the Book',
    description: 'Our AI writes a unique story and creates beautiful illustrations — in minutes.',
  },
  {
    id: 'preview',
    label: '5. Preview & Order',
    icon: '📖',
    title: 'Preview & Print',
    description: 'Read every page before ordering. Print it or keep it as an eBook.',
  },
];

export function HowItWorksDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const STEP_DURATION = 3500;

  const goToStep = (idx: number) => {
    setActiveStep(idx);
    setProgress(0);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 100);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + (100 / (STEP_DURATION / 60));
      });
    }, 60);

    intervalRef.current = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
      setProgress(0);
    }, STEP_DURATION);

    return () => {
      clearTimeout(intervalRef.current!);
      clearInterval(progressRef.current!);
    };
  }, [activeStep, isAutoPlaying]);

  const step = STEPS[activeStep];

  return (
    <section
      style={{
        background: '#fff',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span
            style={{
              display: 'inline-block',
              background: '#f3f0ff',
              color: '#7c3aed',
              borderRadius: 999,
              padding: '4px 16px',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            How It Works
          </span>
          <h2
            className="font-display"
            style={{ fontSize: 42, color: '#111', margin: '0 0 12px', lineHeight: 1.1 }}
          >
            From Photo to Storybook<br />in Minutes
          </h2>
          <p className="font-body" style={{ color: '#6b7280', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            Watch how easy it is to create a personalised book for your child.
          </p>
        </div>

        {/* Main Demo Container */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Step Tabs */}
          <div style={{ flex: '0 0 260px' }}>
            {STEPS.map((s, i) => {
              const isActive = activeStep === i;
              const isDone = i < activeStep;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 14,
                    border: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                    background: isActive ? '#f3f0ff' : isDone ? '#f9fafb' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.25s',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: isActive ? '#7c3aed' : isDone ? '#16a34a' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                      transition: 'background 0.3s',
                    }}
                  >
                    {isDone ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      s.icon
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#7c3aed' : '#374151' }}>
                      {s.label}
                    </div>
                    {/* Progress bar for active step */}
                    {isActive && (
                      <div style={{ height: 3, background: '#e9d5ff', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: '#7c3aed',
                            width: `${progress}%`,
                            transition: 'width 0.06s linear',
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Animated Preview */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div
              key={activeStep}
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                boxShadow: '0 16px 60px rgba(0,0,0,0.08)',
                animation: 'slideInDemo 0.4s ease',
              }}
            >
              {/* Mock Browser Chrome */}
              <div
                style={{
                  background: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fc8181' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f6ad55' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#68d391' }} />
                <div
                  style={{
                    flex: 1,
                    background: '#fff',
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontSize: 12,
                    color: '#9ca3af',
                    fontFamily: 'monospace',
                    marginLeft: 8,
                  }}
                >
                  onceuponatime.com / {step.id}
                </div>
              </div>

              {/* Demo Content */}
              <div
                style={{
                  background: '#fff',
                  padding: '40px 32px',
                  minHeight: 360,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                }}
              >
                {activeStep === 0 && <StepChooseBook />}
                {activeStep === 1 && <StepUploadPhoto />}
                {activeStep === 2 && <StepPersonalize />}
                {activeStep === 3 && <StepAI />}
                {activeStep === 4 && <StepPreview />}
              </div>
            </div>

            {/* Caption */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <h3 className="font-display" style={{ fontSize: 20, margin: '0 0 6px' }}>{step.title}</h3>
              <p className="font-body" style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>{step.description}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <button
            onClick={() => navigate('/templates')}
            className="font-body"
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              padding: '18px 48px',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Create Your Book Now →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInDemo {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}

/* ── Step 1: Choose a Book ── */
function StepChooseBook() {
  const books = [
    { title: 'The Portugal\'s New Legend', cat: 'Sports', color: '#14b8a6', thumb: '/thumbnails/the-portugals-new-legend.webp', selected: false },
    { title: 'Super Boy and the Dragon', cat: 'Fantasy', color: '#a855f7', thumb: '/thumbnails/super-boy-and-the-dragon.webp', selected: true },
    { title: 'The Boy & Cosmic Journey', cat: 'Adventure', color: '#f97316', thumb: '/thumbnails/the-boy-and-the-cosmic-journey.webp', selected: false },
  ];
  return (
    <div>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
        Choose Your Theme
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {books.map((b, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 14px',
              borderRadius: 14,
              border: b.selected ? '2px solid #111' : '1.5px solid #e5e7eb',
              background: b.selected ? '#f9f9f9' : '#fff',
              animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
            }}
          >
            <img
              src={b.thumb}
              style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover' }}
              alt=""
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{b.title}</div>
              <span style={{ fontSize: 11, color: b.color, background: `${b.color}18`, padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                {b.cat}
              </span>
            </div>
            {b.selected && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 2: Upload Photo ── */
function StepUploadPhoto() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
        Upload Your Child's Photo
      </p>

      {phase < 2 ? (
        <div
          style={{
            border: `2px dashed ${phase === 1 ? '#7c3aed' : '#e5e7eb'}`,
            borderRadius: 20,
            padding: '36px 24px',
            textAlign: 'center',
            background: phase === 1 ? '#f3f0ff' : '#fafafa',
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>{phase === 0 ? '📁' : '📷'}</div>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {phase === 0 ? 'Click or drag your photo here' : 'Drop to upload...'}
          </p>
          <p style={{ fontSize: 12, color: '#d1d5db', margin: '6px 0 0' }}>JPEG · PNG · WebP · max 10MB</p>
          {phase === 1 && (
            <div style={{ position: 'relative', margin: '12px auto 0', width: 40, height: 40 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #7c3aed', animation: 'pulse-ring 1s ease infinite' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #7c3aed20' }} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ animation: 'fadeInUp 0.4s ease', display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, background: 'linear-gradient(135deg, #fde68a, #fca5a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, border: '2px solid #111' }}>
              👦
            </div>
            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#16a34a', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>child_photo.jpg</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>2.3 MB · Uploaded ✓</div>
            <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>AI face detected ✓</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Personalize ── */
function StepPersonalize() {
  const [name, setName] = useState('');
  const fullName = 'Emma';

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setName(fullName.slice(0, i));
      if (i >= fullName.length) clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
        Personalise Details
      </p>

      <div>
        <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 4 }}>Child's Name</label>
        <div style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid #7c3aed', background: '#f3f0ff', fontSize: 15, fontWeight: 600, color: '#111', display: 'flex', alignItems: 'center', gap: 4 }}>
          {name}
          <span style={{ width: 2, height: 18, background: '#7c3aed', borderRadius: 1, animation: 'fadeInUp 0.5s ease infinite alternate' }} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 4 }}>Age</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[4, 5, 6, 7, 8].map((age) => (
            <div key={age} style={{ width: 38, height: 38, borderRadius: 10, border: age === 6 ? '2px solid #111' : '1.5px solid #e5e7eb', background: age === 6 ? '#111' : '#fff', color: age === 6 ? '#fff' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
              {age}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 4 }}>Illustration Style</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ icon: '🎨', name: 'Disney', selected: true }, { icon: '✏️', name: 'Sketch', selected: false }, { icon: '🖌️', name: 'Watercolor', selected: false }].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: s.selected ? '2px solid #111' : '1.5px solid #e5e7eb', textAlign: 'center', fontSize: 12, fontWeight: 600, background: s.selected ? '#f9f9f9' : '#fff' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              {s.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: AI Generating ── */
function StepAI() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Writing personalised story...', done: true },
    { label: 'Generating character artwork...', done: true },
    { label: 'Creating 16 unique pages...', done: false },
    { label: 'Composing the final layout...', done: false },
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 20px' }}>
        AI is Creating Your Book ✨
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              opacity: i <= step ? 1 : 0.3,
              transition: 'opacity 0.5s',
              animation: i === step ? 'fadeInUp 0.4s ease' : 'none',
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < step ? '#16a34a' : i === step ? '#7c3aed' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.4s' }}>
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              ) : i === step ? (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', animation: 'pulse-ring 0.8s ease infinite' }} />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af' }} />
              )}
            </div>
            <span style={{ fontSize: 14, fontWeight: i <= step ? 600 : 400, color: i === step ? '#7c3aed' : '#374151' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg, #f3f0ff, #fce7f3)', fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>
        ⏱ Estimated time: 3–5 minutes
      </div>
    </div>
  );
}

/* ── Step 5: Preview ── */
function StepPreview() {
  return (
    <div>
      <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>
        Your Book is Ready!
      </p>

      {/* Book preview mockup */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', text: 'Cover' },
          { bg: 'linear-gradient(135deg, #f97316, #fb923c)', text: 'Page 1' },
          { bg: 'linear-gradient(135deg, #06b6d4, #22d3ee)', text: 'Page 2' },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 100,
              borderRadius: 12,
              background: p.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              animation: `fadeInUp 0.4s ease ${i * 0.15}s both`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {i === 0 ? '👦📖' : p.text}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            flex: 1, padding: '11px 8px', borderRadius: 10, border: '1.5px solid #111',
            background: '#fff', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          📥 eBook PDF
        </button>
        <button
          style={{
            flex: 1, padding: '11px 8px', borderRadius: 10, border: 'none',
            background: '#111', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          📦 Print Book
        </button>
      </div>
    </div>
  );
}
