import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { toast } from 'react-hot-toast';

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
    ADMIN: { bg: '#c8a45c20', color: '#c8a45c' },
    USER: { bg: '#f0ede8', color: '#8a8578' },
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

function DashboardTab({ stats }: { stats: any }) {
  const displayStats = [
    { emoji: '📦', label: 'Total Orders', value: stats?.totalOrders?.toString() || '0', delta: stats?.deltas?.orders || '+0%', up: true },
    { emoji: '💰', label: 'Total Revenue', value: stats?.revenue ? `₹${stats.revenue.toLocaleString()}` : '₹0', delta: stats?.deltas?.revenue || '+0%', up: true },
    { emoji: '👥', label: 'Registered Users', value: stats?.totalUsers?.toString() || '0', delta: stats?.deltas?.users || '+0%', up: true },
    { emoji: '📚', label: 'Books Generated', value: stats?.booksGenerated?.toString() || '0', delta: stats?.deltas?.books || '+0%', up: true },
    { emoji: '⭐', label: 'Avg Rating', value: '4.92', delta: '+0.03', up: true },
    { emoji: '📈', label: 'Conversion Rate', value: '23.4%', delta: '-1.2%', up: false },
  ];

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
        {displayStats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#8a8578' }}>{s.label}</div>
              </div>
              <span style={{ fontSize: 28 }}>{s.emoji}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Recent Activity</h3>
          <p style={{ fontSize: 13, color: '#8a8578' }}>Recent orders and user activity will appear here in real-time.</p>
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

function OrdersTab({ orders }: { orders: any[] }) {
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
        <button style={btnPrimary}>Export CSV</button>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Child</th>
              <th style={thStyle}>Theme</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>No orders found</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: 11 }}>{o.id.slice(0, 8)}...</td>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>{o.user?.firstName || 'Guest'}</td>
                  <td style={tdStyle}>{o.childName}</td>
                  <td style={tdStyle}>{o.theme}</td>
                  <td style={tdStyle}><span style={badge(o.status)}>{o.status}</span></td>
                  <td style={tdStyle}>{o.amountPaid ? `₹${o.amountPaid/100}` : '₹0'}</td>
                  <td style={tdStyle}>
                    <button style={btnOutline} onClick={() => window.open(`/preview/${o.id}`, '_blank')}>View</button>
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

function PricingTab() {
  const [pricing, setPricing] = useState({ ebookPrice: 499, physicalPrice: 1299, shippingPrice: 99 });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pricing').then(r => r.json())
      .then((data: any) => { setPricing(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSavePricing = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await fetch('/api/pricing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pricing) });
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
            <button style={{ ...btnPrimary, marginTop: 8, width: '100%' }}>Save Shipping & Tax</button>
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

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!newCoupon.code || !newCoupon.value) {
      toast.error('Please provide at least a code and a value');
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
        toast.success('Coupon created successfully!');
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
        toast.error(`Error: ${err.message || 'Failed to create coupon'}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to connect to backend');
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
        </div>
        <button style={{ ...btnPrimary, marginTop: 18 }} onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create Coupon'}
        </button>
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
              <th style={thStyle}>Limit</th>
              <th style={thStyle}>Expires</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
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
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab({ users }: { users: any[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Provider</th>
              <th style={thStyle}>Orders</th>
              <th style={thStyle}>Spent</th>
              <th style={thStyle}>Joined</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
                const totalSpent = (u.orders || []).reduce((sum: number, o: any) => sum + (o.amountPaid || 0), 0);
                return (
                  <tr key={u.id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{u.id.slice(0, 8).toUpperCase()}</td>
                    <td style={tdStyle}>{u.firstName} {u.lastName}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.authProvider}</td>
                    <td style={tdStyle}>{u.orders?.length || 0}</td>
                    <td style={tdStyle}>₹{(totalSpent / 100).toLocaleString('en-IN')}</td>
                    <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}><span style={badge(u.role === 'ADMIN' ? 'Active' : 'Pending')}>{u.role}</span></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={btnOutline}>View</button>
                        <button style={{ ...btnOutline, color: '#c47560' }}>Deactivate</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BooksTab() {
  return <div style={cardStyle}>Book management coming soon...</div>;
}

function APITab() {
  return <div style={cardStyle}>API management coming soon...</div>;
}

function PaymentsTab() {
  return <div style={cardStyle}>Payment history coming soon...</div>;
}

function NotificationsTab() {
  return <div style={cardStyle}>Notification triggers coming soon...</div>;
}

function SettingsTab() {
  return <div style={cardStyle}>Site settings coming soon...</div>;
}

function AuditTab() {
  return <div style={cardStyle}>Audit logs coming soon...</div>;
}

export function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [stats, setStats] = useState<any>({ totalOrders: 0, revenue: 0, totalUsers: 0, booksGenerated: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      console.log('Redirecting to login: not authenticated');
      navigate('/login');
      return;
    }
    if (user && user.role !== 'ADMIN') {
      console.warn('Redirecting to home: not admin', user.role);
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/admin/stats').then(res => res.data),
          api.get('/admin/orders').then(res => res.data),
          api.get('/admin/users').then(res => res.data),
        ]);
        // WAIT! Axios api client already has /api prefix? YES.
        setStats(statsRes);
        setOrders(ordersRes);
        setUsers(usersRes);
      } catch (e: any) {
        console.error('Admin data fetch failed:', e);
        if (e.response?.status === 403 || e.response?.status === 401) {
          setError('Unauthorized: Admin access required');
        } else {
          setError('Failed to load dashboard data');
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated, user, navigate, authLoading]);

  if (authLoading || (loading && stats === null)) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Admin Panel...</div>;

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2 style={{ color: '#c47560' }}>{error}</h2>
      <button style={btnPrimary} onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab stats={stats} />;
      case 'orders': return <OrdersTab orders={orders} />;
      case 'pricing': return <PricingTab />;
      case 'coupons': return <CouponsTab />;
      case 'users': return <UsersTab users={users} />;
      case 'books': return <BooksTab />;
      case 'payments': return <PaymentsTab />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf9f7',
      display: 'flex',
      fontFamily: 'Inter, sans-serif',
      color: '#1a1814',
    }}>
      <aside style={{
        width: 240,
        background: '#1a1814',
        color: '#e8e4de',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
      }}>
        <div style={{ padding: '0 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>⚙️</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Admin Panel</h1>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {navSections.map((section) => (
            <div key={section.title} style={{ marginBottom: 24 }}>
              {section.title && (
                <div style={{ padding: '0 12px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', marginBottom: 8 }}>
                  {section.title}
                </div>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: activeTab === item.id ? '#c8a45c20' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: activeTab === item.id ? '#c8a45c' : '#8a8578',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: activeTab === item.id ? 600 : 500 }}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px 48px', marginLeft: 240 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>{tabTitles[activeTab].title}</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#8a8578' }}>{tabTitles[activeTab].subtitle}</p>
          </div>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#1a1814',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}>{user?.firstName?.[0] || 'A'}</div>
        </header>
        {renderTab()}
      </main>
    </div>
  );
}
