import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminOrders, getAdminDashboardStats, getPricing, savePricing } from '../api/orders';

type Tab =
  | 'dashboard'
  | 'orders'
  | 'pricing'
  | 'coupons'
  | 'users'
  | 'books'
  | 'payments';

const tabPaths: Record<Tab, string> = {
  dashboard: '/admin',
  orders: '/admin/orders',
  pricing: '/admin/pricing',
  coupons: '/admin/coupons',
  users: '/admin/users',
  books: '/admin/books',
  payments: '/admin/payments',
};

function getTabFromPath(pathname: string): Tab {
  const match = Object.entries(tabPaths).find(([, path]) => pathname === path);
  return (match?.[0] as Tab) || 'dashboard';
}

interface NavItem {
  id: Tab;
  label: string;
  emoji: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  { title: '', items: [{ id: 'dashboard', label: 'Dashboard', emoji: '📊' }] },
  {
    title: 'Commerce',
    items: [
      { id: 'orders', label: 'Orders', emoji: '📦' },
      { id: 'pricing', label: 'Pricing', emoji: '💰' },
      { id: 'coupons', label: 'Coupons', emoji: '🎟️' },
    ],
  },
  {
    title: 'Users',
    items: [
      { id: 'users', label: 'Users', emoji: '👥' },
      { id: 'books', label: 'Books', emoji: '📚' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { id: 'payments', label: 'Payments', emoji: '💳' },
    ],
  },
];

const tabTitles: Record<Tab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your platform' },
  orders: { title: 'Orders', subtitle: 'Manage customer orders' },
  pricing: { title: 'Pricing', subtitle: 'Configure product pricing & shipping' },
  coupons: { title: 'Coupons', subtitle: 'Manage discount codes' },
  users: { title: 'Users', subtitle: 'Manage registered users' },
  books: { title: 'Books', subtitle: 'All generated storybooks' },
  payments: { title: 'Payments', subtitle: 'Transaction history & analytics' },
};

/* ── Shared Styles ── */

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  border: '1px solid #e8e4de',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #e8e4de',
  color: '#8a8578',
  fontWeight: 500,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f0ede8',
  color: '#1a1814',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d5d0c8',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  background: '#faf9f7',
  outline: 'none',
  color: '#1a1814',
};

const btnPrimary: React.CSSProperties = {
  padding: '8px 18px',
  background: '#1a1814',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  fontWeight: 500,
};

const btnOutline: React.CSSProperties = {
  padding: '8px 18px',
  background: 'transparent',
  color: '#1a1814',
  border: '1px solid #d5d0c8',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
  paddingRight: 28,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a8578'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
};

function badge(status: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    PAID: { bg: '#6e997310', color: '#3a7048' },
    PRINTING: { bg: '#4a90d910', color: '#2a6cb8' },
    SHIPPED: { bg: '#5bc0de10', color: '#31708f' },
    DELIVERED: { bg: '#6e997310', color: '#3a7048' },
    FAILED: { bg: '#c4756010', color: '#c47560' },
    CREATED: { bg: '#c8a45c10', color: '#9a7020' },
    STORY_GENERATING: { bg: '#c8a45c10', color: '#9a7020' },
    IMAGES_GENERATING: { bg: '#c8a45c10', color: '#9a7020' },
    PDF_GENERATING: { bg: '#c8a45c10', color: '#9a7020' },
    PREVIEW_READY: { bg: '#6e997310', color: '#3a7048' },
    Active: { bg: '#6e997310', color: '#3a7048' },
    Pending: { bg: '#c8a45c10', color: '#9a7020' },
    Suspended: { bg: '#c4756010', color: '#c47560' },
  };
  const c = map[status] || { bg: '#e8e4de', color: '#8a8578' };
  return {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: c.bg,
    color: c.color,
  };
}

/* ── Tab Components ── */

function DashboardTab() {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    getAdminDashboardStats()
      .then((data) => setDashboardData(data))
      .catch((err) => console.error('Failed to fetch stats:', err));
  }, []);

  const stats: any[] = [
    { emoji: '📦', label: 'Total Orders', value: dashboardData ? dashboardData.totalOrders.toLocaleString() : '...' },
    { emoji: '💰', label: 'Revenue MTD', value: dashboardData ? `₹${(dashboardData.revenueMtd / 100).toLocaleString('en-IN')}` : '...' },
    { emoji: '👥', label: 'Registered Users', value: dashboardData ? dashboardData.totalUsers.toLocaleString() : '...' },
    { emoji: '📚', label: 'Books Generated', value: dashboardData ? dashboardData.totalBooks.toLocaleString() : '...' },
    { emoji: '⭐', label: 'Avg Rating', value: '4.92', delta: '+0.03', up: true },
    { emoji: '📈', label: 'Conversion Rate', value: '23.4%', delta: '-1.2%', up: false },
  ];

  const recentOrders = dashboardData?.recentOrders?.map((o: any) => ({
    id: o.id.slice(0, 8).toUpperCase(),
    customer: o.user ? `${o.user.firstName} ${o.user.lastName}` : (o.shippingName || 'Guest'),
    format: o.shippingName ? 'Print + eBook' : 'eBook',
    status: o.status,
    amount: o.amountPaid ? `₹${(o.amountPaid / 100).toLocaleString('en-IN')}` : '₹0'
  })) || [];

  const quickActions = [
    '📦 Process Pending Orders',
    '🔄 Retry Failed Generations',
    '📧 Send Bulk Notification',
    '💰 Update Pricing',
    '🎟️ Create Coupon Code',
    '📊 Export Monthly Report',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#8a8578' }}>{s.label}</div>
              </div>
              <span style={{ fontSize: 28 }}>{s.emoji}</span>
            </div>
            {'delta' in s && s.delta && (
              <div style={{ marginTop: 8, fontSize: 12, color: s.up ? '#3a7048' : '#c47560', fontWeight: 600 }}>
                {s.up ? '↑' : '↓'} {s.delta}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Recent Orders</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Format</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {!dashboardData ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '20px 0', color: '#8a8578' }}>
                    Loading recent orders...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '20px 0', color: '#8a8578' }}>
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o: any) => (
                  <tr key={o.id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{o.id}</td>
                    <td style={tdStyle}>{o.customer}</td>
                    <td style={tdStyle}>{o.format}</td>
                    <td style={tdStyle}><span style={badge(o.status)}>{o.status}</span></td>
                    <td style={tdStyle}>{o.amount}</td>
                    <td style={tdStyle}><button style={btnOutline}>View</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickActions.map((a) => (
              <button key={a} style={{ ...btnOutline, textAlign: 'left', padding: '10px 14px' }}>{a}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => console.error('Failed to fetch orders:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: 13, color: '#8a8578' }}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Search orders..." />
        <select style={selectStyle}>
          <option>All Statuses</option>
          <option>PAID</option>
          <option>PRINTING</option>
          <option>SHIPPED</option>
          <option>DELIVERED</option>
          <option>FAILED</option>
        </select>
        <select style={selectStyle}>
          <option>All Formats</option>
          <option>eBook</option>
          <option>Print + eBook</option>
        </select>
        <input style={inputStyle} type="date" />
        <button style={btnPrimary}>Export CSV</button>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Book Theme</th>
              <th style={thStyle}>Format</th>
              <th style={thStyle}>Delivery</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: '40px 0', color: '#8a8578' }}>
                  No orders found. Create a book to see it here!
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{o.id.slice(0, 8).toUpperCase()}</td>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>{o.user ? `${o.user.firstName} ${o.user.lastName}` : (o.shippingName || 'Guest')}</td>
                  <td style={tdStyle}>{o.theme || 'Custom'}</td>
                  <td style={tdStyle}>{o.shippingName ? 'Print + eBook' : 'eBook'}</td>
                  <td style={tdStyle}>{o.shippingName ? 'Standard' : 'Instant'}</td>
                  <td style={tdStyle}><span style={badge(o.status)}>{o.status}</span></td>
                  <td style={tdStyle}>{o.amountPaid ? `₹${(o.amountPaid / 100).toLocaleString('en-IN')}` : '₹0'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={btnOutline}>View</button>
                      <button style={{ ...btnOutline, color: '#c47560' }}>Refund</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {orders.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <button style={btnOutline}>Prev</button>
            <span style={{ fontSize: 13, color: '#8a8578' }}>Page 1 of {Math.ceil(orders.length / 10)}</span>
            <button style={btnOutline}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingTab() {
  const [pricing, setPricing] = useState({ ebookPrice: 499, physicalPrice: 1299, shippingPrice: 99 });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPricing()
      .then((data) => { setPricing(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSavePricing = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await savePricing(pricing);
      setSaveMsg('Pricing saved successfully!');
    } catch {
      setSaveMsg('Failed to save pricing.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Product Pricing</h3>
        {loading ? (
          <div style={{ fontSize: 13, color: '#8a8578' }}>Loading...</div>
        ) : (
          <>
            {[
              { label: 'eBook Price', key: 'ebookPrice' as const },
              { label: 'Physical Book Price', key: 'physicalPrice' as const },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <label style={{ flex: 1, fontSize: 13, color: '#1a1814' }}>{f.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{ padding: '8px 10px', background: '#f0ede8', border: '1px solid #d5d0c8', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#8a8578' }}>{'\u20b9'}</span>
                  <input
                    style={{ ...inputStyle, borderRadius: '0 8px 8px 0', width: 100 }}
                    value={pricing[f.key]}
                    onChange={(e) => setPricing({ ...pricing, [f.key]: Number(e.target.value) })}
                    type="number"
                    min={0}
                  />
                </div>
              </div>
            ))}
            {saveMsg && (
              <div style={{ fontSize: 12, color: saveMsg.includes('success') ? '#3a7048' : '#c47560', marginBottom: 8 }}>
                {saveMsg}
              </div>
            )}
            <button
              style={{ ...btnPrimary, marginTop: 8, width: '100%', opacity: saving ? 0.7 : 1 }}
              onClick={handleSavePricing}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Pricing'}
            </button>
          </>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Shipping &amp; Tax</h3>
        {loading ? (
          <div style={{ fontSize: 13, color: '#8a8578' }}>Loading...</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <label style={{ flex: 1, fontSize: 13, color: '#1a1814' }}>Standard Shipping</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <span style={{ padding: '8px 10px', background: '#f0ede8', border: '1px solid #d5d0c8', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#8a8578' }}>{'\u20b9'}</span>
                <input
                  style={{ ...inputStyle, borderRadius: '0 8px 8px 0', width: 100 }}
                  value={pricing.shippingPrice}
                  onChange={(e) => setPricing({ ...pricing, shippingPrice: Number(e.target.value) })}
                  type="number"
                  min={0}
                />
              </div>
            </div>
            {[
              { label: 'Express Delivery', value: '199', prefix: '₹' },
              { label: 'Priority Delivery', value: '349', prefix: '₹' },
              { label: 'Free Shipping Threshold', value: '1999', prefix: '₹' },
              { label: 'Tax Rate', value: '18', prefix: '%' },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <label style={{ flex: 1, fontSize: 13, color: '#1a1814' }}>{f.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{ padding: '8px 10px', background: '#f0ede8', border: '1px solid #d5d0c8', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#8a8578' }}>{f.prefix}</span>
                  <input style={{ ...inputStyle, borderRadius: '0 8px 8px 0', width: 100 }} defaultValue={f.value} />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <label style={{ flex: 1, fontSize: 13, color: '#1a1814' }}>Default Currency</label>
              <select style={{ ...selectStyle, width: 140 }}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <button
              style={{ ...btnPrimary, marginTop: 8, width: '100%', opacity: saving ? 0.7 : 1 }}
              onClick={handleSavePricing}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Shipping & Tax'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: '',
    maxUses: '',
    expiryDate: '',
    minOrder: '',
    syncWithRazorpay: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error('Failed to fetch coupons:', e);
    }
  };

  useState(() => {
    fetchCoupons();
  });

  const handleCreate = async () => {
    if (!newCoupon.code || !newCoupon.value) {
      alert('Please provide at least a code and a value');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCoupon.code,
          name: newCoupon.code,
          type: newCoupon.type === 'Fixed Amount' ? 'flat' : 'percentage',
          value: parseInt(newCoupon.value),
          usageLimit: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : undefined,
          validTill: newCoupon.expiryDate ? new Date(newCoupon.expiryDate).toISOString() : undefined,
          minAmount: newCoupon.minOrder ? parseInt(newCoupon.minOrder) * 100 : undefined,
          syncWithRazorpay: newCoupon.syncWithRazorpay,
        }),
      });

      if (res.ok) {
        alert('Coupon created successfully!');
        setNewCoupon({
          code: '',
          type: 'percentage',
          value: '',
          maxUses: '',
          expiryDate: '',
          minOrder: '',
          syncWithRazorpay: true,
        });
        fetchCoupons();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to create coupon'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to backend');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Create Coupon</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Code</label>
            <input 
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
              placeholder="e.g. SUMMER25" 
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Discount Type</label>
            <select 
              style={{ ...selectStyle, width: '100%', boxSizing: 'border-box' }}
              value={newCoupon.type}
              onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Fixed Amount (Paise)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Value</label>
            <input 
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
              placeholder="e.g. 20" 
              value={newCoupon.value}
              onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Max Uses</label>
            <input 
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
              placeholder="e.g. 500" 
              value={newCoupon.maxUses}
              onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Expiry Date</label>
            <input 
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
              type="date" 
              value={newCoupon.expiryDate}
              onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Min Order (INR)</label>
            <input 
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
              placeholder="e.g. 999" 
              value={newCoupon.minOrder}
              onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
          <input 
            type="checkbox" 
            checked={newCoupon.syncWithRazorpay} 
            onChange={(e) => setNewCoupon({ ...newCoupon, syncWithRazorpay: e.target.checked })}
          />
          <label style={{ fontSize: 13, color: '#1a1814' }}>Sync with Razorpay API</label>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button 
            style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} 
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
          <button 
            style={btnOutline}
            onClick={() => setNewCoupon({ ...newCoupon, code: Math.random().toString(36).substring(2, 8).toUpperCase() })}
          >
            Auto-Generate Code
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Active Coupons</h3>
          <button style={{ ...btnOutline, padding: '4px 10px', fontSize: 12 }} onClick={fetchCoupons}>Refresh</button>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Value</th>
              <th style={thStyle}>Used</th>
              <th style={thStyle}>Max</th>
              <th style={thStyle}>Expiry</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8a8578' }}>
                  No coupons found. Create your first discount code above.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id}>
                  <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'monospace' }}>{c.code}</td>
                  <td style={tdStyle}>{c.type}</td>
                  <td style={tdStyle}>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value/100}`}</td>
                  <td style={tdStyle}>{c.usageCount}</td>
                  <td style={tdStyle}>{c.usageLimit || '∞'}</td>
                  <td style={tdStyle}>{c.validTill ? new Date(c.validTill).toLocaleDateString() : 'Never'}</td>
                  <td style={tdStyle}><span style={badge(c.active ? 'Active' : 'Expired')}>{c.active ? 'Active' : 'Expired'}</span></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        style={{ ...btnOutline, color: '#c47560' }}
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const users = [
    { id: 'USR-001', name: 'Priya Sharma', email: 'priya@email.com', auth: 'Google', books: 4, orders: 3, spent: '₹6,297', joined: '2025-12-01', status: 'Active' },
    { id: 'USR-002', name: 'Rahul Mehta', email: 'rahul@email.com', auth: 'Email', books: 2, orders: 2, spent: '₹998', joined: '2026-01-15', status: 'Active' },
    { id: 'USR-003', name: 'Anita Desai', email: 'anita@email.com', auth: 'Google', books: 7, orders: 5, spent: '₹12,495', joined: '2025-11-20', status: 'Active' },
    { id: 'USR-004', name: 'Vikram Patel', email: 'vikram@email.com', auth: 'Apple', books: 1, orders: 1, spent: '₹3,999', joined: '2026-03-28', status: 'Suspended' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Search users..." />
        <select style={selectStyle}>
          <option>All Auth Methods</option>
          <option>Google</option>
          <option>Apple</option>
          <option>Email</option>
        </select>
        <select style={selectStyle}>
          <option>All Statuses</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
        <button style={btnPrimary}>Export CSV</button>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Auth</th>
              <th style={thStyle}>Books</th>
              <th style={thStyle}>Orders</th>
              <th style={thStyle}>Spent</th>
              <th style={thStyle}>Joined</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{u.id}</td>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.auth}</td>
                <td style={tdStyle}>{u.books}</td>
                <td style={tdStyle}>{u.orders}</td>
                <td style={tdStyle}>{u.spent}</td>
                <td style={tdStyle}>{u.joined}</td>
                <td style={tdStyle}><span style={badge(u.status)}>{u.status}</span></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={btnOutline}>View</button>
                    <button style={{ ...btnOutline, color: '#c47560' }}>Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button style={btnOutline}>Prev</button>
          <span style={{ fontSize: 13, color: '#8a8578' }}>Page 1 of 78</span>
          <button style={btnOutline}>Next</button>
        </div>
      </div>
    </div>
  );
}

function BooksTab() {
  const books = [
    { id: 'BK-5024', title: 'Dino Adventure', occasion: 'Birthday', style: 'Disney/Pixar', user: 'Priya Sharma', generated: '2026-04-07', pages: 16, status: 'Completed' },
    { id: 'BK-5023', title: 'Space Journey', occasion: 'Just Because', style: 'Disney/Pixar', user: 'Rahul Mehta', generated: '2026-04-06', pages: 16, status: 'Completed' },
    { id: 'BK-5022', title: 'Fairy Garden', occasion: 'Christmas', style: 'Watercolor', user: 'Anita Desai', generated: '2026-04-06', pages: 16, status: 'Completed' },
    { id: 'BK-5021', title: 'Ocean Quest', occasion: 'Birthday', style: 'Disney/Pixar', user: 'Vikram Patel', generated: '2026-04-05', pages: 16, status: 'Generating' },
    { id: 'BK-5020', title: 'Jungle Safari', occasion: 'Graduation', style: 'Comic Book', user: 'Meera Iyer', generated: '2026-04-05', pages: 16, status: 'Failed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Search books..." />
        <select style={selectStyle}>
          <option>All Occasions</option>
          <option>Birthday</option>
          <option>Christmas</option>
          <option>Just Because</option>
          <option>Graduation</option>
        </select>
        <select style={selectStyle}>
          <option>All Styles</option>
          <option>Disney/Pixar</option>
          <option>Watercolor</option>
          <option>Comic Book</option>
        </select>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Book ID</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Occasion</th>
              <th style={thStyle}>Style</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Generated</th>
              <th style={thStyle}>Pages</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{b.id}</td>
                <td style={tdStyle}>{b.title}</td>
                <td style={tdStyle}>{b.occasion}</td>
                <td style={tdStyle}>{b.style}</td>
                <td style={tdStyle}>{b.user}</td>
                <td style={tdStyle}>{b.generated}</td>
                <td style={tdStyle}>{b.pages}</td>
                <td style={tdStyle}><span style={badge(b.status)}>{b.status}</span></td>
                <td style={tdStyle}><button style={btnOutline}>Preview</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const stats = [
    { label: 'Captured', value: '₹64,82,100', color: '#3a7048' },
    { label: 'Pending', value: '₹3,41,200', color: '#9a7020' },
    { label: 'Refunded', value: '₹1,24,860', color: '#c47560' },
    { label: 'Failed', value: '₹50,400', color: '#c47560' },
  ];

  const transactions = [
    { id: 'TXN-98201', date: '2026-04-07', customer: 'Priya Sharma', order: 'ORD-4821', method: 'UPI', amount: '₹2,499', status: 'Captured' },
    { id: 'TXN-98200', date: '2026-04-06', customer: 'Rahul Mehta', order: 'ORD-4820', method: 'Card', amount: '₹499', status: 'Captured' },
    { id: 'TXN-98199', date: '2026-04-06', customer: 'Anita Desai', order: 'ORD-4819', method: 'UPI', amount: '₹1,299', status: 'Refunded' },
    { id: 'TXN-98198', date: '2026-04-05', customer: 'Vikram Patel', order: 'ORD-4818', method: 'Net Banking', amount: '₹3,999', status: 'Pending' },
    { id: 'TXN-98197', date: '2026-04-05', customer: 'Meera Iyer', order: 'ORD-4817', method: 'Card', amount: '₹2,499', status: 'Failed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ fontSize: 12, color: '#8a8578', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Transaction History</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Txn ID</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Order</th>
              <th style={thStyle}>Method</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'monospace' }}>{t.id}</td>
                <td style={tdStyle}>{t.date}</td>
                <td style={tdStyle}>{t.customer}</td>
                <td style={tdStyle}>{t.order}</td>
                <td style={tdStyle}>{t.method}</td>
                <td style={tdStyle}>{t.amount}</td>
                <td style={tdStyle}><span style={badge(t.status)}>{t.status}</span></td>
                <td style={tdStyle}><button style={btnOutline}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Admin Page ── */

export function AdminPage() {
  const location = useLocation();
  const activeTab = getTabFromPath(location.pathname);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'orders': return <OrdersTab />;
      case 'pricing': return <PricingTab />;
      case 'coupons': return <CouponsTab />;
      case 'users': return <UsersTab />;
      case 'books': return <BooksTab />;
      case 'payments': return <PaymentsTab />;
    }
  };

  const info = tabTitles[activeTab];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Responsive styles */}
      <style>{`
        .admin-layout { display: flex; min-height: 100vh; }
        .admin-sidebar {
          width: 230px; min-width: 230px; background: #1a1814; position: sticky; top: 0;
          height: 100vh; overflow-y: auto; display: flex; flex-direction: column;
          padding: 24px 0;
        }
        .admin-main { flex: 1; overflow-y: auto; background: #f0ede8; }
        .admin-topbar-mobile { display: none; }
        @media (max-width: 900px) {
          .admin-layout { flex-direction: column; }
          .admin-sidebar {
            width: 100%; min-width: 100%; height: auto; position: relative;
            flex-direction: row; flex-wrap: wrap; padding: 12px 16px; gap: 4px;
            align-items: center;
          }
          .admin-sidebar .nav-section-title { display: none; }
          .admin-sidebar .sidebar-logo { margin-bottom: 0; margin-right: 16px; }
          .admin-sidebar .sidebar-back { margin-top: 0; margin-left: auto; }
          .admin-main { min-height: calc(100vh - 60px); }
        }
      `}</style>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo" style={{ padding: '0 20px', marginBottom: 32 }}>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, color: '#fff', fontWeight: 400 }}>
              <span role="img" aria-label="gear">&#9881;&#65039;</span> Admin Panel
            </span>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
            {navSections.map((section, si) => (
              <div key={si}>
                {section.title && (
                  <div className="nav-section-title" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: '#6b665c', padding: '16px 8px 6px', fontWeight: 600 }}>
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(tabPaths[item.id])}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '9px 12px',
                        border: 'none',
                        borderRadius: 8,
                        background: isActive ? '#c8a45c15' : 'transparent',
                        color: isActive ? '#c8a45c' : '#a09a8e',
                        fontSize: 13,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = '#ffffff08';
                          (e.currentTarget as HTMLElement).style.color = '#d5d0c8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#a09a8e';
                        }
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{item.emoji}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="sidebar-back" style={{ padding: '0 12px', marginTop: 'auto' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                borderRadius: 8,
                background: 'transparent',
                color: '#6b665c',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 14 }}>&larr;</span> Back to Site
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 32px',
            background: '#fff',
            borderBottom: '1px solid #e8e4de',
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1814' }}>{info.title}</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8a8578' }}>{info.subtitle}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                background: '#6e997310',
                color: '#3a7048',
                fontSize: 12,
                fontWeight: 600,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3a7048' }} />
                Live
              </span>
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#1a1814',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {user?.firstName?.[0]?.toUpperCase() || 'A'}
                </button>
                {showProfileMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 42,
                    right: 0,
                    width: 220,
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
                    border: '1px solid #e8e4de',
                    overflow: 'hidden',
                    zIndex: 100,
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0ede8' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1814' }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: '#8a8578', marginTop: 2 }}>
                        {user?.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        color: '#c47560',
                        fontSize: 13,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#faf9f7'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: 32 }}>
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
}
