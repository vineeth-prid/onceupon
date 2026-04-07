import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { completeOrder } from '../api/orders';

type Format = 'ebook' | 'print';
type DeliverySpeed = 'standard' | 'express' | 'priority';
type PaymentMethod = 'card' | 'apple' | 'google';

const FORMATS = [
  { id: 'ebook' as Format, label: 'eBook Only', price: 1499, desc: 'Instant download, PDF & ePub' },
  { id: 'print' as Format, label: 'Print + eBook', price: 4499, desc: 'Printed book + digital copy', badge: 'MOST POPULAR' },
];

const DELIVERY_OPTIONS = [
  { id: 'standard' as DeliverySpeed, label: 'Standard', time: '7-10 days', price: 199 },
  { id: 'express' as DeliverySpeed, label: 'Express', time: '3-5 days', price: 399 },
  { id: 'priority' as DeliverySpeed, label: 'Priority', time: '1-2 days', price: 699 },
];

const ADDONS = [
  { id: 'gift', label: 'Gift Packaging', price: 499 },
  { id: 'certificate', label: 'Certificate of Memory', price: 249 },
  { id: 'bookmark', label: 'Bookmark Set', price: 149 },
];

function formatPrice(paise: number) {
  return `\u20B9${paise.toLocaleString('en-IN')}`;
}

export function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [format, setFormat] = useState<Format>('ebook');
  const [delivery, setDelivery] = useState<DeliverySpeed>('standard');
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState<null | 'success' | 'error'>(null);
  const [discountPct, setDiscountPct] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>('card');

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', address1: '', address2: '',
    city: '', postcode: '', country: 'IN', phone: '',
  });

  const [card, setCard] = useState({
    number: '', expiry: '', cvv: '', name: '',
  });

  const isPrint = format === 'print';

  const toggleAddon = (id: string) =>
    setAddons(prev => ({ ...prev, [id]: !prev[id] }));

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'MEMORY10') {
      setPromoApplied('success');
      setDiscountPct(10);
    } else {
      setPromoApplied('error');
      setDiscountPct(0);
    }
  };

  const breakdown = useMemo(() => {
    const chosen = FORMATS.find(f => f.id === format)!;
    const bookPrice = chosen.price;
    const printPrice = isPrint ? 0 : 0; // included in format price
    const deliveryPrice = isPrint ? DELIVERY_OPTIONS.find(d => d.id === delivery)!.price : 0;
    const addonTotal = ADDONS.reduce((sum, a) => sum + (addons[a.id] ? a.price : 0), 0);
    const subtotal = bookPrice + deliveryPrice + addonTotal;
    const discount = Math.round(subtotal * discountPct / 100);
    const total = subtotal - discount;
    return { bookPrice, printPrice, deliveryPrice, addonTotal, discount, total };
  }, [format, delivery, addons, discountPct, isPrint]);

  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!orderId) return;
    setPlacing(true);
    try {
      await completeOrder(orderId);
      navigate(`/progress/${orderId}`, { state: { mode: 'full' } });
    } catch {
      setPlacing(false);
      alert('Failed to process order. Please try again.');
    }
  };

  // --- styles ---
  const radioCard = (active: boolean): React.CSSProperties => ({
    border: active ? '2px solid #000' : '1px solid #E0E0E0',
    borderRadius: 8,
    padding: '16px 20px',
    cursor: 'pointer',
    background: active ? '#FAFAFA' : '#FFF',
    transition: 'all 0.15s ease',
  });

  const sectionTitle: React.CSSProperties = {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 20,
    color: '#000',
    marginBottom: 12,
  };

  const label: React.CSSProperties = {
    fontSize: 13, color: '#6F6F6F', marginBottom: 4, display: 'block',
  };

  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0',
    borderRadius: 6, fontSize: 14, fontFamily: '"Inter", sans-serif',
    color: '#000', background: '#FFF', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#6F6F6F', marginBottom: 32 }} className="font-body">
        <Link to="/" style={{ color: '#6F6F6F', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link to={`/preview/${orderId}`} style={{ color: '#6F6F6F', textDecoration: 'none' }}>Preview</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#000' }}>Checkout</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="checkout-grid">
        {/* ======= LEFT COLUMN ======= */}
        <div style={{ order: 2 }} className="checkout-main">
          <h1 className="font-display" style={{ fontSize: 32, color: '#000', marginBottom: 40, fontWeight: 400 }}>
            Almost there — your book awaits.
          </h1>

          {/* --- Format Selection --- */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionTitle}>Format</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FORMATS.map(f => (
                <div
                  key={f.id}
                  style={radioCard(format === f.id)}
                  onClick={() => setFormat(f.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: format === f.id ? '5px solid #000' : '2px solid #ccc',
                        display: 'inline-block', flexShrink: 0,
                        boxSizing: 'border-box',
                      }} />
                      <div>
                        <span style={{ fontWeight: 500, fontSize: 15, color: '#000' }}>{f.label}</span>
                        {f.badge && (
                          <span style={{
                            marginLeft: 10, fontSize: 10, fontWeight: 600,
                            background: '#000', color: '#FFF', padding: '2px 8px',
                            borderRadius: 4, letterSpacing: 0.5, verticalAlign: 'middle',
                          }}>{f.badge}</span>
                        )}
                        <div style={{ fontSize: 13, color: '#6F6F6F', marginTop: 2 }}>{f.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 16, color: '#000' }}>{formatPrice(f.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- Delivery Speed --- */}
          {isPrint && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={sectionTitle}>Delivery Speed</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DELIVERY_OPTIONS.map(d => (
                  <div key={d.id} style={radioCard(delivery === d.id)} onClick={() => setDelivery(d.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: delivery === d.id ? '5px solid #000' : '2px solid #ccc',
                          display: 'inline-block', flexShrink: 0, boxSizing: 'border-box',
                        }} />
                        <div>
                          <span style={{ fontWeight: 500, fontSize: 14, color: '#000' }}>{d.label}</span>
                          <span style={{ fontSize: 13, color: '#6F6F6F', marginLeft: 8 }}>{d.time}</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 14, color: '#000' }}>{formatPrice(d.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- Shipping Address --- */}
          {isPrint && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={sectionTitle}>Shipping Address</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={label}>First Name</label>
                  <input
                    style={input}
                    value={shipping.firstName}
                    onChange={e => setShipping(s => ({ ...s, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={label}>Last Name</label>
                  <input
                    style={input}
                    value={shipping.lastName}
                    onChange={e => setShipping(s => ({ ...s, lastName: e.target.value }))}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={label}>Address Line 1</label>
                  <input
                    style={input}
                    value={shipping.address1}
                    onChange={e => setShipping(s => ({ ...s, address1: e.target.value }))}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={label}>Address Line 2</label>
                  <input
                    style={input}
                    value={shipping.address2}
                    onChange={e => setShipping(s => ({ ...s, address2: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={label}>City</label>
                  <input
                    style={input}
                    value={shipping.city}
                    onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={label}>Postcode</label>
                  <input
                    style={input}
                    value={shipping.postcode}
                    onChange={e => setShipping(s => ({ ...s, postcode: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={label}>Country</label>
                  <select
                    style={{ ...input, appearance: 'none' }}
                    value={shipping.country}
                    onChange={e => setShipping(s => ({ ...s, country: e.target.value }))}
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
                <div>
                  <label style={label}>Phone</label>
                  <input
                    style={input}
                    value={shipping.phone}
                    onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                  />
                </div>
              </div>
            </section>
          )}

          {/* --- Add-ons --- */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionTitle}>Add-ons</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ADDONS.map(a => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', border: '1px solid #E0E0E0', borderRadius: 8,
                    background: addons[a.id] ? '#FAFAFA' : '#FFF', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => toggleAddon(a.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 4, display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      border: addons[a.id] ? 'none' : '2px solid #ccc',
                      background: addons[a.id] ? '#000' : '#FFF',
                      color: '#FFF', fontSize: 13, fontWeight: 700,
                      boxSizing: 'border-box',
                    }}>
                      {addons[a.id] ? '\u2713' : ''}
                    </span>
                    <span style={{ fontSize: 14, color: '#000' }}>{a.label}</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#6F6F6F' }}>+{formatPrice(a.price)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* --- Promo Code --- */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionTitle}>Promo Code</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                style={{ ...input, flex: 1 }}
                placeholder="Enter code"
                value={promo}
                onChange={e => { setPromo(e.target.value); setPromoApplied(null); }}
              />
              <button
                onClick={applyPromo}
                style={{
                  padding: '10px 24px', background: '#000', color: '#FFF',
                  border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', fontFamily: '"Inter", sans-serif',
                }}
              >
                Apply
              </button>
            </div>
            {promoApplied === 'success' && (
              <p style={{ fontSize: 13, color: '#2E7D32', marginTop: 8 }}>MEMORY10 applied — 10% off!</p>
            )}
            {promoApplied === 'error' && (
              <p style={{ fontSize: 13, color: '#C62828', marginTop: 8 }}>Invalid promo code.</p>
            )}
          </section>

          {/* --- Payment Method --- */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionTitle}>Payment Method</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {([
                { id: 'card' as PaymentMethod, label: 'Credit / Debit Card' },
                { id: 'apple' as PaymentMethod, label: 'Apple Pay' },
                { id: 'google' as PaymentMethod, label: 'Google Pay' },
              ]).map(m => (
                <div
                  key={m.id}
                  style={{
                    ...radioCard(payment === m.id),
                    flex: 1, textAlign: 'center' as const, padding: '14px 10px',
                  }}
                  onClick={() => setPayment(m.id)}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: payment === m.id ? '#000' : '#6F6F6F' }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>

            {payment === 'card' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={label}>Card Number</label>
                  <input
                    style={input}
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={label}>Expiry</label>
                  <input
                    style={input}
                    placeholder="MM / YY"
                    value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={label}>CVV</label>
                  <input
                    style={input}
                    placeholder="123"
                    value={card.cvv}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={label}>Name on Card</label>
                  <input
                    style={input}
                    value={card.name}
                    onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </section>

          {/* --- Place Order --- */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{
              width: '100%', padding: '16px 0',
              background: placing ? '#666' : '#000', color: '#FFF',
              border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
              cursor: placing ? 'wait' : 'pointer', fontFamily: '"Inter", sans-serif',
              letterSpacing: 0.3,
            }}
          >
            {placing ? 'Processing...' : `Place Order — ${formatPrice(breakdown.total)}`}
          </button>
        </div>

        {/* ======= RIGHT COLUMN — ORDER SUMMARY ======= */}
        <div style={{ order: 1 }} className="checkout-sidebar">
          <div style={{
            position: 'sticky' as const, top: 100,
            border: '1px solid #E0E0E0', borderRadius: 10,
            padding: 28, background: '#FAFAFA',
          }}>
            <h3 className="font-display" style={{ fontSize: 20, color: '#000', marginBottom: 20, fontWeight: 400 }}>
              Order Summary
            </h3>

            <p style={{ fontSize: 15, fontWeight: 500, color: '#000', marginBottom: 16 }}>Your Storybook</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                <span>Book Creation</span>
                <span>{formatPrice(breakdown.bookPrice)}</span>
              </div>

              {isPrint && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6F6F6F' }}>
                  <span>Printing</span>
                  <span>Included</span>
                </div>
              )}

              {isPrint && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6F6F6F' }}>
                  <span>Delivery</span>
                  <span>{formatPrice(breakdown.deliveryPrice)}</span>
                </div>
              )}

              {breakdown.addonTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6F6F6F' }}>
                  <span>Add-ons</span>
                  <span>{formatPrice(breakdown.addonTotal)}</span>
                </div>
              )}

              {breakdown.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                  <span>Discount ({discountPct}%)</span>
                  <span>-{formatPrice(breakdown.discount)}</span>
                </div>
              )}

              <div style={{
                borderTop: '1px solid #E0E0E0', paddingTop: 12, marginTop: 4,
                display: 'flex', justifyContent: 'space-between',
                fontWeight: 700, fontSize: 16, color: '#000',
              }}>
                <span>Total</span>
                <span>{formatPrice(breakdown.total)}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24,
              paddingTop: 16, borderTop: '1px solid #E0E0E0',
            }}>
              {['Secure', 'Guaranteed', 'Tracked'].map(badge => (
                <span key={badge} style={{ fontSize: 11, color: '#6F6F6F', letterSpacing: 0.5, textTransform: 'uppercase' as const }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .checkout-grid {
          grid-template-columns: 1fr !important;
        }
        .checkout-sidebar { order: 1; }
        .checkout-main { order: 2; }

        @media (min-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr 360px !important;
          }
          .checkout-main { order: 1 !important; }
          .checkout-sidebar { order: 2 !important; }
        }
      `}</style>
    </div>
  );
}
