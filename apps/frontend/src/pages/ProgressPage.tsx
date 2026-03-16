import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../api/orders';

const STATUS_CONFIG: Record<string, { label: string; icon: string; progress: number }> = {
  CREATED: { label: 'Warming up the magic...', icon: '\u2728', progress: 5 },
  STORY_GENERATING: { label: 'Writing your magical story...', icon: '\uD83D\uDCDD', progress: 20 },
  STORY_COMPLETE: { label: 'Story complete! Starting illustrations...', icon: '\uD83C\uDFA8', progress: 35 },
  IMAGES_GENERATING: { label: 'Painting beautiful illustrations...', icon: '\uD83D\uDD8C\uFE0F', progress: 50 },
  IMAGES_COMPLETE: { label: 'All illustrations done!', icon: '\uD83C\uDF1F', progress: 85 },
  PDF_GENERATING: { label: 'Assembling your storybook...', icon: '\uD83D\uDCD6', progress: 92 },
  PREVIEW_READY: { label: 'Your book is ready!', icon: '\uD83C\uDF89', progress: 100 },
  FAILED: { label: 'Something went wrong', icon: '\uD83D\uDE1E', progress: 0 },
};

export function ProgressPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState('CREATED');
  const [completedPages, setCompletedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(16);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;

    const poll = setInterval(async () => {
      try {
        const data = await getOrder(orderId);
        setStatus(data.progress.status);
        setCompletedPages(data.progress.completedPages);
        setTotalPages(data.progress.totalPages);

        if (data.progress.status === 'PREVIEW_READY' || data.progress.status === 'IMAGES_COMPLETE') {
          clearInterval(poll);
          setTimeout(() => navigate(`/preview/${orderId}`), 1200);
        }
        if (data.progress.status === 'FAILED') {
          clearInterval(poll);
          if (data.progress.completedPages > 0) {
            setError(`${data.progress.completedPages} of ${data.progress.totalPages} pages generated. Showing available pages...`);
            setTimeout(() => navigate(`/preview/${orderId}`), 2000);
          } else {
            setError('Generation failed. Please try again.');
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    getOrder(orderId).then((data) => {
      setStatus(data.progress.status);
      setCompletedPages(data.progress.completedPages);
      setTotalPages(data.progress.totalPages);
    }).catch(() => {});

    return () => clearInterval(poll);
  }, [orderId, navigate]);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.CREATED;
  const imageProgress = status === 'IMAGES_GENERATING' && totalPages > 0
    ? Math.round(35 + (completedPages / totalPages) * 50)
    : config.progress;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #4a1a8a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
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
      `}</style>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        borderRadius: 30,
        padding: '3rem 2.5rem',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'fadeIn 0.5s ease',
      }}>
        {/* Animated icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          animation: status === 'PREVIEW_READY' ? 'none' : 'bookFloat 3s ease-in-out infinite',
        }}>
          {config.icon}
        </div>

        <h1 style={{
          fontFamily: "'Baloo 2', cursive",
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 0.5rem',
        }}>
          Creating Your Storybook
        </h1>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.75)',
          margin: '0 0 2rem',
        }}>
          {config.label}
        </p>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 50,
          height: 12,
          overflow: 'hidden',
          marginBottom: '0.8rem',
          position: 'relative',
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF6347)',
            height: '100%',
            width: `${imageProgress}%`,
            transition: 'width 0.8s ease',
            borderRadius: 50,
            animation: 'progressGlow 2s ease-in-out infinite',
          }} />
        </div>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 1rem',
        }}>
          {status === 'IMAGES_GENERATING'
            ? `${completedPages} / ${totalPages} illustrations`
            : `${imageProgress}% complete`
          }
        </p>

        {/* Spinning loader */}
        {!error && status !== 'FAILED' && status !== 'PREVIEW_READY' && (
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #FFD700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '1rem auto 0',
          }}>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '1rem',
            animation: 'fadeIn 0.3s ease',
          }}>
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
