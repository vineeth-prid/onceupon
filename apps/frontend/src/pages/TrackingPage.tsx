import { useParams, useNavigate, Link } from 'react-router-dom';

interface TimelineStep {
  label: string;
  timestamp: string;
  description: string;
  done: boolean;
  current: boolean;
}

const timeline: TimelineStep[] = [
  {
    label: 'Order Placed',
    timestamp: 'Apr 7, 2026 at 10:32 AM',
    description: 'Your order has been confirmed and payment received.',
    done: true,
    current: false,
  },
  {
    label: 'Generating Your Book',
    timestamp: 'Apr 7, 2026 at 10:33 AM',
    description: 'Our AI is crafting your personalized illustrations and story pages. This usually takes 5-10 minutes.',
    done: false,
    current: true,
  },
  {
    label: 'Sent to Print',
    timestamp: '',
    description: 'Your book will be printed on premium paper with a hardcover finish.',
    done: false,
    current: false,
  },
  {
    label: 'Dispatched',
    timestamp: '',
    description: 'Your book has been packaged and handed to the carrier.',
    done: false,
    current: false,
  },
  {
    label: 'Delivered',
    timestamp: '',
    description: 'Your book has arrived at its destination.',
    done: false,
    current: false,
  },
];

export function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const orderNumber = `#OAT-2026-${(orderId ?? '00000').padStart(5, '0').slice(-5)}`;

  return (
    <div className="font-body" style={{ minHeight: '80vh', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: '#6F6F6F', marginBottom: 32 }}>
          <Link to="/" style={{ color: '#6F6F6F', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/profile" style={{ color: '#6F6F6F', textDecoration: 'none' }}>My Account</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#000' }}>Order Tracking</span>
        </nav>

        {/* Heading */}
        <h1 className="font-display" style={{ fontSize: 36, color: '#000', margin: '0 0 8px' }}>
          Tracking your book
        </h1>
        <p style={{ fontSize: 14, color: '#6F6F6F', margin: '0 0 40px' }}>
          Order {orderNumber} &middot; Placed on April 7, 2026
        </p>

        {/* ETA cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 }}>
          <div style={{
            border: '1px solid #E0E0E0', borderRadius: 12, padding: '24px',
            background: '#FAFAFA',
          }}>
            <div style={{ fontSize: 12, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Estimated Delivery
            </div>
            <div className="font-display" style={{ fontSize: 22, color: '#000' }}>April 18, 2026</div>
          </div>
          <div style={{
            border: '1px solid #E0E0E0', borderRadius: 12, padding: '24px',
            background: '#FAFAFA',
          }}>
            <div style={{ fontSize: 12, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Current Status
            </div>
            <div className="font-display" style={{ fontSize: 22, color: '#000' }}>Generating Book</div>
          </div>
        </div>

        {/* Vertical timeline */}
        <div style={{ marginBottom: 48 }}>
          {timeline.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              {/* Left: dot + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: step.done ? '#000' : step.current ? '#000' : '#E0E0E0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: step.current ? 'pulse 2s infinite' : undefined,
                  flexShrink: 0,
                }}>
                  {step.done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {step.current && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFF' }} />
                  )}
                </div>
                {i < timeline.length - 1 && (
                  <div style={{
                    width: 2, flex: 1, background: step.done ? '#000' : '#E0E0E0',
                  }} />
                )}
              </div>

              {/* Right: content */}
              <div style={{ paddingBottom: i < timeline.length - 1 ? 32 : 0, flex: 1 }}>
                <div style={{
                  fontSize: 16, fontWeight: 600,
                  color: step.done || step.current ? '#000' : '#6F6F6F',
                  marginBottom: 4,
                }}>
                  {step.label}
                </div>
                {step.timestamp && (
                  <div style={{ fontSize: 12, color: '#6F6F6F', marginBottom: 6 }}>
                    {step.timestamp}
                  </div>
                )}
                <div style={{ fontSize: 14, color: '#6F6F6F', lineHeight: 1.5 }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carrier card */}
        <div style={{
          border: '1px solid #E0E0E0', borderRadius: 12, padding: '24px 28px',
          background: '#FAFAFA', marginBottom: 48,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: '0 0 16px' }}>
            Carrier Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Carrier
              </div>
              <div style={{ fontSize: 15, color: '#000', fontWeight: 500 }}>DHL Express Tracked</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Tracking Number
              </div>
              <div style={{ fontSize: 15, color: '#6F6F6F', fontStyle: 'italic' }}>Pending</div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link to="/contact" style={{ fontSize: 14, color: '#000', textDecoration: 'underline' }}>
            Need help?
          </Link>
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: '12px 28px', borderRadius: 8, border: '1px solid #000',
              background: '#FFF', color: '#000', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Back to My Orders
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
