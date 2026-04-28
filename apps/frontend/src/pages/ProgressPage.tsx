import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrder } from '../api/orders';

const PREVIEW_STEPS = [
  { status: 'CREATED', label: 'Setting up your story...', detail: 'Preparing the canvas', icon: '\u2728', progress: 5 },
  { status: 'STORY_GENERATING', label: 'Writing a magical tale...', detail: 'Our AI author is crafting your story', icon: '\uD83D\uDCDD', progress: 25 },
  { status: 'STORY_COMPLETE', label: 'Story written!', detail: 'Now creating your character', icon: '\uD83C\uDFA8', progress: 40 },
  { status: 'IMAGES_GENERATING', label: 'Painting your preview...', detail: 'Bringing your child to life in the scene', icon: '\uD83D\uDD8C\uFE0F', progress: 65 },
  { status: 'PREVIEW_READY', label: 'Preview is ready!', detail: 'Redirecting to your book...', icon: '\uD83C\uDF89', progress: 100 },
];

const FULL_STEPS = [
  { status: 'PAID', label: 'Payment received!', detail: 'Starting full book creation', icon: '\u2705', progress: 3 },
  { status: 'STORY_GENERATING', label: 'Writing complete story...', detail: 'Crafting all 16 pages of your tale', icon: '\uD83D\uDCDD', progress: 10 },
  { status: 'STORY_COMPLETE', label: 'Full story written!', detail: 'Preparing illustrations', icon: '\uD83D\uDCD6', progress: 15 },
  { status: 'IMAGES_GENERATING', label: 'Painting illustrations...', detail: '', icon: '\uD83D\uDD8C\uFE0F', progress: 20 },
  { status: 'IMAGES_COMPLETE', label: 'All illustrations done!', detail: 'Assembling your book', icon: '\uD83C\uDF1F', progress: 90 },
  { status: 'PDF_GENERATING', label: 'Building your book...', detail: 'Adding finishing touches', icon: '\uD83D\uDCD6', progress: 95 },
  { status: 'ORDER_CONFIRMED', label: 'Your book is ready!', detail: 'Opening your storybook...', icon: '\uD83C\uDF89', progress: 100 },
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #4a1a8a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes progressGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
          50% { box-shadow: 0 0 25px rgba(255,215,0,0.6); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
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
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Background stars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        {[...Array(25)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            borderRadius: '50%',
            background: 'rgba(255,215,0,0.3)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        borderRadius: 30,
        padding: '2.5rem 2.5rem 2rem',
        maxWidth: 460,
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'fadeIn 0.5s ease',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Animated icon */}
        <div style={{
          fontSize: '3.5rem',
          marginBottom: '1rem',
          animation: status === 'PREVIEW_READY' ? 'none' : 'bookFloat 3s ease-in-out infinite',
        }}>
          {currentStep.icon}
        </div>

        <h1 style={{
          fontFamily: "'Baloo 2', cursive",
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 0.3rem',
        }}>
          {isFullMode ? 'Creating Your Full Book' : 'Generating Preview'}
        </h1>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '1rem',
          color: '#FFD700',
          margin: '0 0 0.3rem',
          fontWeight: 600,
        }}>
          {currentStep.label}
        </p>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.55)',
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
                  ? '#FFD700'
                  : i === currentStepIndex
                  ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                  : 'rgba(255,255,255,0.15)',
                transition: 'all 0.5s ease',
                ...(i === currentStepIndex ? {
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                  backgroundImage: 'linear-gradient(90deg, #FFD700 0%, #fff 50%, #FFD700 100%)',
                } : {}),
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 50,
          height: 10,
          overflow: 'hidden',
          marginBottom: '0.6rem',
          position: 'relative',
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF6347)',
            height: '100%',
            width: `${progress}%`,
            transition: 'width 1s ease',
            borderRadius: 50,
            animation: 'progressGlow 2s ease-in-out infinite',
          }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1.4rem',
          fontSize: '0.78rem',
          fontFamily: "'Nunito', sans-serif",
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{progress}%</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>{formatTime(elapsed)}</span>
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
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : i === completedPages
                    ? 'rgba(255,215,0,0.4)'
                    : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.4s ease',
                  boxShadow: i < completedPages ? '0 0 6px rgba(255,215,0,0.3)' : 'none',
                  ...(i === completedPages ? {
                    animation: 'progressGlow 1.5s ease-in-out infinite',
                  } : {}),
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
            border: '3px solid rgba(255,255,255,0.08)',
            borderTop: '3px solid #FFD700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
        )}

        {/* Fun fact */}
        {!error && status !== 'FAILED' && status !== 'PREVIEW_READY' && (
          <div style={{
            background: 'rgba(255,215,0,0.06)',
            borderRadius: 12,
            padding: '10px 16px',
            border: '1px solid rgba(255,215,0,0.1)',
          }}>
            <p
              key={factIndex}
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '0.78rem',
                color: 'rgba(255,215,0,0.7)',
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
              color: '#FF6B6B',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.9rem',
              margin: '0 0 1rem',
            }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.6rem 2rem',
                borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
