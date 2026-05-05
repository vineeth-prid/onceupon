import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrder } from '../api/orders';

const PREVIEW_STEPS = [
  { status: 'CREATED', label: 'Setting up your story...', detail: 'Preparing the canvas', icon: '✨', progress: 5 },
  { status: 'STORY_GENERATING', label: 'Writing a magical tale...', detail: 'Our AI author is crafting your story', icon: '📝', progress: 25 },
  { status: 'STORY_COMPLETE', label: 'Story written!', detail: 'Now creating your character', icon: '🎨', progress: 40 },
  { status: 'IMAGES_GENERATING', label: 'Painting your preview...', detail: 'Bringing your child to life in the scene', icon: '🖌️', progress: 65 },
  { status: 'PREVIEW_READY', label: 'Preview is ready!', detail: 'Redirecting to your book...', icon: '🎉', progress: 100 },
];

const FULL_STEPS = [
  { status: 'PAID', label: 'Payment received!', detail: 'Starting full book creation', icon: '✅', progress: 3 },
  { status: 'STORY_GENERATING', label: 'Writing complete story...', detail: 'Crafting all 16 pages of your tale', icon: '📝', progress: 10 },
  { status: 'STORY_COMPLETE', label: 'Full story written!', detail: 'Preparing illustrations', icon: '📖', progress: 15 },
  { status: 'IMAGES_GENERATING', label: 'Painting illustrations...', detail: '', icon: '🖌️', progress: 20 },
  { status: 'IMAGES_COMPLETE', label: 'All illustrations done!', detail: 'Assembling your book', icon: '🌟', progress: 90 },
  { status: 'PDF_GENERATING', label: 'Building your book...', detail: 'Adding finishing touches', icon: '📖', progress: 95 },
  { status: 'ORDER_CONFIRMED', label: 'Your book is ready!', detail: 'Opening your storybook...', icon: '🎉', progress: 100 },
];

const FUN_FACTS = [
  'Did you know? Each illustration is unique and created just for your child.',
  'Fun fact: Our AI reads your photo to match your child\'s appearance!',
  'Your story is being personalized with your child\'s name on every page.',
  'Each book has hand-crafted scenes with cinematic lighting.',
  'Your child is the star of this adventure!',
  'The illustrations use Disney/Pixar-quality 3D rendering.',
  'Every scene is designed to spark imagination and wonder.',
  'This storybook is one-of-a-kind — no two are the same!',
];

const PAGE_BG = 'linear-gradient(180deg, #EDE4F8 0%, #E2D6F5 45%, #D5C4ED 100%)';
const FONT_UI = "'Inter', sans-serif";
const FONT_HEADING = "'Instrument Serif', serif";
const ACCENT = '#7B3FA0';
const PROGRESS_GRADIENT = 'linear-gradient(90deg, #16a34a, #AB47BC)';

export function ProgressPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isFullMode = (location.state as any)?.mode === 'full';
  const [status, setStatus] = useState(isFullMode ? 'PAID' : 'CREATED');
  const [completedPages, setCompletedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(16);
  const [error, setError] = useState('');
  const [factIndex, setFactIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  const steps = isFullMode ? FULL_STEPS : PREVIEW_STEPS;
  const currentStepIndex = steps.findIndex((s) => s.status === status);
  const currentStep = steps[currentStepIndex] || steps[0];

  // Rotate fun facts every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((i) => (i + 1) % FUN_FACTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll for status
  useEffect(() => {
    if (!orderId) return;

    const poll = setInterval(async () => {
      try {
        const data = await getOrder(orderId);
        setStatus(data.progress.status);
        setCompletedPages(data.progress.completedPages);
        setTotalPages(data.progress.totalPages);

        if (data.progress.status === 'PREVIEW_READY' || data.progress.status === 'IMAGES_COMPLETE' || data.progress.status === 'ORDER_CONFIRMED' || data.progress.status === 'DELIVERED') {
          clearInterval(poll);
          setTimeout(() => navigate(`/preview/${orderId}`), 1500);
        }
        if (data.progress.status === 'FAILED') {
          clearInterval(poll);
          if (data.progress.completedPages > 0) {
            setError('Some pages generated. Showing available pages...');
            setTimeout(() => navigate(`/preview/${orderId}`), 2000);
          } else {
            setError('Generation failed. Please try again.');
          }
        }
      } catch { /* ignore */ }
    }, 3000);

    getOrder(orderId).then((data) => {
      setStatus(data.progress.status);
      setCompletedPages(data.progress.completedPages);
      setTotalPages(data.progress.totalPages);
    }).catch(() => {});

    return () => clearInterval(poll);
  }, [orderId, navigate]);

  // Calculate progress
  let progress = currentStep.progress;
  if (isFullMode && status === 'IMAGES_GENERATING' && totalPages > 0) {
    progress = Math.round(15 + (completedPages / totalPages) * 75);
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  // Special clean screen for payment confirmation (before generation starts)
  const isPaymentConfirmed = isFullMode && status === 'PAID';

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    boxShadow: '0 8px 32px rgba(45, 27, 105, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    animation: 'fadeIn 0.5s ease',
    position: 'relative',
    zIndex: 1,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: PAGE_BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSwitch {
          0% { opacity: 0; transform: translateY(8px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes checkPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Soft decorative dots — same vibe as preview page */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', opacity: 0.55 }}>
        <div style={{ position: 'absolute', top: '10%', left: '7%', width: 6, height: 6, borderRadius: '50%', background: '#FFD700' }} />
        <div style={{ position: 'absolute', top: '18%', right: '9%', width: 4, height: 4, borderRadius: '50%', background: '#AB47BC' }} />
        <div style={{ position: 'absolute', bottom: '22%', left: '5%', width: 5, height: 5, borderRadius: '50%', background: '#16a34a' }} />
        <div style={{ position: 'absolute', bottom: '14%', right: '7%', width: 4, height: 4, borderRadius: '50%', background: '#FFD700' }} />
        <div style={{ position: 'absolute', top: '50%', left: '3%', width: 3, height: 3, borderRadius: '50%', background: '#7B3FA0' }} />
        <div style={{ position: 'absolute', top: '40%', right: '4%', width: 3, height: 3, borderRadius: '50%', background: '#16a34a' }} />
      </div>

      {isPaymentConfirmed ? (
        /* ── PAYMENT CONFIRMED: Clean, minimal confirmation ── */
        <div style={{
          ...cardStyle,
          padding: '3rem 2.5rem',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '4.5rem',
            marginBottom: '1.2rem',
            animation: 'checkPop 0.6s ease-out',
            filter: 'drop-shadow(0 4px 14px rgba(22, 163, 74, 0.25))',
          }}>
            ✅
          </div>

          <h1 style={{
            fontFamily: FONT_HEADING,
            fontSize: '2rem',
            fontWeight: 400,
            color: '#111',
            margin: '0 0 0.5rem',
            letterSpacing: 0.3,
          }}>
            Payment Received
          </h1>

          <p style={{
            fontFamily: FONT_UI,
            fontSize: '0.95rem',
            color: '#666',
            margin: 0,
          }}>
            Preparing your storybook…
          </p>
        </div>
      ) : (
        /* ── GENERATION PROGRESS: Full progress UI ── */
        <div style={{
          ...cardStyle,
          padding: '2.5rem 2.5rem 2rem',
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
        }}>
          {/* Animated icon */}
          <div style={{
            fontSize: '3.5rem',
            marginBottom: '1rem',
            animation: status === 'PREVIEW_READY' || status === 'ORDER_CONFIRMED' ? 'none' : 'bookFloat 3s ease-in-out infinite',
          }}>
            {currentStep.icon}
          </div>

          <p style={{
            fontFamily: FONT_HEADING,
            fontSize: '1.5rem',
            fontWeight: 400,
            color: '#111',
            margin: '0 0 0.3rem',
            letterSpacing: 0.2,
          }}>
            {currentStep.label}
          </p>

          <p style={{
            fontFamily: FONT_UI,
            fontSize: '0.85rem',
            color: '#666',
            margin: '0 0 1.5rem',
            minHeight: '1.2em',
          }}>
            {isFullMode && status === 'IMAGES_GENERATING'
              ? `Painting illustration ${completedPages + 1} of ${totalPages}...`
              : currentStep.detail}
          </p>

          {/* Step indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginBottom: '1.2rem',
          }}>
            {steps.map((step, i) => (
              <div
                key={step.status}
                style={{
                  width: i <= currentStepIndex ? 28 : 10,
                  height: 6,
                  borderRadius: 3,
                  background: i < currentStepIndex
                    ? '#16a34a'
                    : i === currentStepIndex
                    ? 'rgba(0,0,0,0.08)'
                    : 'rgba(0,0,0,0.06)',
                  transition: 'all 0.5s ease',
                  ...(i === currentStepIndex ? {
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s linear infinite',
                    backgroundImage: 'linear-gradient(90deg, #16a34a 0%, #AB47BC 50%, #16a34a 100%)',
                  } : {}),
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div style={{
            background: 'rgba(0,0,0,0.06)',
            borderRadius: 50,
            height: 10,
            overflow: 'hidden',
            marginBottom: '0.6rem',
            position: 'relative',
          }}>
            <div style={{
              background: PROGRESS_GRADIENT,
              height: '100%',
              width: `${progress}%`,
              transition: 'width 1s ease',
              borderRadius: 50,
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.4rem',
            fontSize: '0.78rem',
            fontFamily: FONT_UI,
          }}>
            <span style={{ color: '#777', fontWeight: 600 }}>{progress}%</span>
            <span style={{ color: '#999' }}>{formatTime(elapsed)}</span>
          </div>

          {/* Image progress for full mode */}
          {isFullMode && status === 'IMAGES_GENERATING' && totalPages > 0 && (
            <div style={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '1.2rem',
            }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 18,
                    height: 24,
                    borderRadius: 3,
                    background: i < completedPages
                      ? 'linear-gradient(135deg, #16a34a, #AB47BC)'
                      : i === completedPages
                      ? 'rgba(171, 71, 188, 0.35)'
                      : 'rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.4s ease',
                    boxShadow: i < completedPages ? '0 2px 6px rgba(123, 63, 160, 0.18)' : 'none',
                  }}
                />
              ))}
            </div>
          )}

          {/* Spinning loader */}
          {!error && status !== 'FAILED' && status !== 'PREVIEW_READY' && (
            <div style={{
              width: 36,
              height: 36,
              border: '3px solid rgba(0,0,0,0.06)',
              borderTop: `3px solid ${ACCENT}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }} />
          )}

          {/* Fun fact */}
          {!error && status !== 'FAILED' && status !== 'PREVIEW_READY' && (
            <div style={{
              background: 'rgba(123, 63, 160, 0.06)',
              borderRadius: 14,
              padding: '10px 16px',
              border: '1px solid rgba(123, 63, 160, 0.12)',
            }}>
              <p
                key={factIndex}
                style={{
                  fontFamily: FONT_UI,
                  fontSize: '0.78rem',
                  color: '#5b2d7a',
                  margin: 0,
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                  animation: 'fadeSwitch 6s ease-in-out',
                }}
              >
                {FUN_FACTS[factIndex]}
              </p>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
              <p style={{
                color: '#D32F2F',
                fontFamily: FONT_UI,
                fontSize: '0.9rem',
                margin: '0 0 1rem',
              }}>
                {error}
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary"
                style={{ padding: '0.6rem 1.6rem', fontSize: '0.9rem' }}
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
