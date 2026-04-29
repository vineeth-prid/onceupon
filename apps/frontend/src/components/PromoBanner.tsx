import { useState, useEffect } from 'react';
import { fetchActiveCoupons } from '../api/orders';

interface ActiveCoupon {
  code: string;
  name: string;
  type: string;
  value: number;
  maxDiscount: number | null;
  minAmount: number | null;
  validTill: string | null;
}

/**
 * A slim, animated promotional banner that appears below the navbar.
 * Dynamically fetches the best active coupon from the backend and
 * displays a compelling message. Auto-rotates through multiple coupons
 * if available.
 */
export function PromoBanner() {
  const [coupons, setCoupons] = useState<ActiveCoupon[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner this session
    const wasDismissed = sessionStorage.getItem('promoBannerDismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    fetchActiveCoupons()
      .then((data: ActiveCoupon[]) => {
        if (data && data.length > 0) {
          setCoupons(data);
          // Small delay so the banner slides in after the page paints
          setTimeout(() => setLoaded(true), 300);
        }
      })
      .catch(() => {
        // Silently fail — no banner shown
      });
  }, []);

  // Auto-rotate through coupons every 5 seconds
  useEffect(() => {
    if (coupons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % coupons.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [coupons.length]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('promoBannerDismissed', 'true');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      // Brief visual feedback via the button text
      const btn = document.getElementById('promo-copy-btn');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 1500);
      }
    }).catch(() => {});
  };

  if (dismissed || coupons.length === 0 || !loaded) return null;

  const coupon = coupons[currentIdx];

  // Build the dynamic message
  const buildMessage = (c: ActiveCoupon): string => {
    if (c.type === 'percentage') {
      let msg = `Get ${c.value}% OFF`;
      if (c.maxDiscount) {
        msg += ` (up to ₹${(c.maxDiscount / 100).toLocaleString('en-IN')})`;
      }
      msg += ` — Use Code`;
      return msg;
    } else {
      return `Get ₹${c.value.toLocaleString('en-IN')} OFF — Use Code`;
    }
  };

  // Time-remaining text for urgency
  const getUrgencyText = (c: ActiveCoupon): string | null => {
    if (!c.validTill) return null;
    const remaining = new Date(c.validTill).getTime() - Date.now();
    if (remaining <= 0) return null;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    if (days === 0) return '⏰ Expires today!';
    if (days === 1) return '⏰ Expires tomorrow!';
    if (days <= 7) return `⏰ ${days} days left!`;
    return null;
  };

  const message = buildMessage(coupon);
  const urgency = getUrgencyText(coupon);

  return (
    <div
      id="promo-banner"
      style={{
        position: 'relative',
        zIndex: 49,
        background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: '10px 48px 10px 16px',
        fontFamily: '"Inter", sans-serif',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.02em',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: loaded ? 'translateY(0)' : 'translateY(-100%)',
        opacity: loaded ? 1 : 0,
      }}
    >
      {/* Subtle animated shimmer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '200%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        animation: 'promoBannerShimmer 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
        position: 'relative',
      }}>
        <span style={{ opacity: 0.9 }}>🎉</span>
        <span>{message}</span>
        <button
          id="promo-copy-btn"
          onClick={() => handleCopy(coupon.code)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFD700',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.1em',
            padding: '3px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '"Inter", monospace',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.25)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          title="Click to copy code"
        >
          {coupon.code}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
        {urgency && (
          <span style={{
            fontSize: 11,
            opacity: 0.8,
            marginLeft: 4,
          }}>
            {urgency}
          </span>
        )}
        {coupon.minAmount && (
          <span style={{ fontSize: 11, opacity: 0.6 }}>
            (Min. ₹{(coupon.minAmount / 100).toLocaleString('en-IN')})
          </span>
        )}

        {/* Coupon rotation dots */}
        {coupons.length > 1 && (
          <div style={{
            display: 'flex',
            gap: 4,
            marginLeft: 8,
          }}>
            {coupons.map((_, i) => (
              <span
                key={i}
                onClick={() => setCurrentIdx(i)}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: i === currentIdx ? '#FFD700' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss promo banner"
        style={{
          position: 'absolute',
          top: '50%',
          right: 12,
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 18,
          cursor: 'pointer',
          padding: 4,
          lineHeight: 1,
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}
      >
        ✕
      </button>

      <style>{`
        @keyframes promoBannerShimmer {
          0% { transform: translateX(-50%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
