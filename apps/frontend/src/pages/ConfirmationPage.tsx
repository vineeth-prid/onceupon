import { useParams, useNavigate } from 'react-router-dom';

const steps = [
  { label: 'Order Placed', done: true },
  { label: 'Generating Book', current: true },
  { label: 'Printing', done: false },
  { label: 'Dispatched', done: false },
  { label: 'Delivered', done: false },
];

export function ConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const orderNumber = `#OAT-2026-${(orderId ?? '00000').padStart(5, '0').slice(-5)}`;
  const estimatedDelivery = 'April 18, 2026';

  return (
    <div className="font-body" style={{ minHeight: '80vh', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>

        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#000',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-display" style={{ fontSize: 40, color: '#000', margin: '0 0 12px' }}>
          Your book is on its way!
        </h1>
        <p style={{ fontSize: 16, color: '#6F6F6F', margin: '0 0 48px', lineHeight: 1.6 }}>
          We've received your order and sent a confirmation to your email.
          Your personalized storybook will be with you soon.
        </p>

        {/* Order Details card */}
        <div style={{
          border: '1px solid #E0E0E0', borderRadius: 12, padding: '32px 28px',
          textAlign: 'left', marginBottom: 48, background: '#FAFAFA',
        }}>
          <h2 className="font-display" style={{ fontSize: 20, color: '#000', margin: '0 0 24px' }}>
            Order Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px' }}>
            <Detail label="Order Number" value={orderNumber} />
            <Detail label="Estimated Delivery" value={estimatedDelivery} />
            <Detail label="Book Title" value="The Enchanted Adventure" />
            <Detail label="Format" value="Hardcover, 24 pages" />
            <Detail label="Illustration Style" value="Disney / Pixar 3D" />
          </div>
        </div>

        {/* Production Status stepper */}
        <div style={{ marginBottom: 48 }}>
          <h2 className="font-display" style={{ fontSize: 20, color: '#000', margin: '0 0 28px' }}>
            Production Status
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {steps.map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
                  {/* Circle */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: step.done ? '#000' : step.current ? '#000' : '#E0E0E0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: step.current ? 'pulse 2s infinite' : undefined,
                  }}>
                    {step.done && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {step.current && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFF' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 12, color: step.done || step.current ? '#000' : '#6F6F6F',
                    marginTop: 8, fontWeight: step.current ? 600 : 400, textAlign: 'center',
                  }}>
                    {step.label}
                  </span>
                </div>
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div style={{
                    width: 40, height: 2, background: step.done ? '#000' : '#E0E0E0',
                    marginTop: -16, flexShrink: 0,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Share section */}
        <div style={{
          borderTop: '1px solid #E0E0E0', paddingTop: 32, marginBottom: 40,
        }}>
          <h3 className="font-display" style={{ fontSize: 20, color: '#000', margin: '0 0 12px' }}>
            Share the love
          </h3>
          <p style={{ fontSize: 14, color: '#6F6F6F', margin: '0 0 16px' }}>
            Let friends and family know about your custom storybook.
          </p>
          <button
            style={{
              padding: '10px 28px', borderRadius: 8, border: '1px solid #000',
              background: '#FFF', color: '#000', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Once Upon a Time', text: 'Check out this personalized storybook!', url: window.location.href });
              }
            }}
          >
            Share
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <ActionButton label="Track My Order" onClick={() => navigate(`/tracking/${orderId}`)} primary />
          <ActionButton label="Create Another Book" onClick={() => navigate('/create')} />
          <ActionButton label="View Account" onClick={() => navigate('/profile')} />
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#6F6F6F', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 15, color: '#000', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function ActionButton({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
        border: primary ? 'none' : '1px solid #000',
        background: primary ? '#000' : '#FFF',
        color: primary ? '#FFF' : '#000',
      }}
    >
      {label}
    </button>
  );
}
