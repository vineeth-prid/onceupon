import { useState, useEffect, useRef, useCallback } from 'react';
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
    // Paid / fulfilled statuses — green
    PAID: { bg: '#dcfce7', color: '#166534' },
    ORDER_CONFIRMED: { bg: '#dcfce7', color: '#166534' },
    DELIVERED: { bg: '#dcfce7', color: '#166534' },
    // In-transit statuses — blue
    PRINTING: { bg: '#dbeafe', color: '#1e40af' },
    SHIPPED: { bg: '#e0f2fe', color: '#0c4a6e' },
    // Failed — red
    FAILED: { bg: '#fee2e2', color: '#991b1b' },
    // Generation / processing — amber
    CREATED: { bg: '#fef3c7', color: '#92400e' },
    STORY_GENERATING: { bg: '#fef3c7', color: '#92400e' },
    STORY_COMPLETE: { bg: '#fef3c7', color: '#92400e' },
    IMAGES_GENERATING: { bg: '#fef3c7', color: '#92400e' },
    IMAGES_COMPLETE: { bg: '#fef3c7', color: '#92400e' },
    PDF_GENERATING: { bg: '#fef3c7', color: '#92400e' },
    // Preview ready — purple/indigo (distinct from paid green)
    PREVIEW_READY: { bg: '#e8e0f0', color: '#5b21b6' },
    PAYMENT_PENDING: { bg: '#fef3c7', color: '#92400e' },
    // Order type badges
    Purchased: { bg: '#dcfce7', color: '#166534' },
    'Preview Only': { bg: '#ede9fe', color: '#6d28d9' },
    Processing: { bg: '#fef3c7', color: '#92400e' },
    // Other badges used elsewhere
    Active: { bg: '#dcfce7', color: '#166534' },
    Pending: { bg: '#fef3c7', color: '#92400e' },
    Suspended: { bg: '#fee2e2', color: '#991b1b' },
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

/** Classify an order as Purchased, Preview Only, Processing, or Failed */
function getOrderType(order: any): string {
  // If the order has been paid (has a paymentId or amountPaid > 0)
  const paidStatuses = ['PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'];
  if (paidStatuses.includes(order.status) || order.paymentId || (order.amountPaid && order.amountPaid > 0)) {
    return 'Purchased';
  }
  // If the order failed
  if (order.status === 'FAILED') {
    return 'Failed';
  }
  // If the order is still generating
  const processingStatuses = ['CREATED', 'STORY_GENERATING', 'STORY_COMPLETE', 'IMAGES_GENERATING', 'IMAGES_COMPLETE', 'PDF_GENERATING'];
  if (processingStatuses.includes(order.status)) {
    return 'Processing';
  }
  // PREVIEW_READY or PAYMENT_PENDING without payment
  return 'Preview Only';
}

/* ── Polling interval in milliseconds ── */
const POLL_INTERVAL_MS = 30_000;


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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // All possible order statuses from the schema
  const allStatuses = [
    'CREATED', 'STORY_GENERATING', 'STORY_COMPLETE',
    'IMAGES_GENERATING', 'IMAGES_COMPLETE', 'PDF_GENERATING',
    'PREVIEW_READY', 'PAYMENT_PENDING', 'PAID',
    'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'FAILED',
  ];

  const orderTypeOptions = ['Purchased', 'Preview Only', 'Processing', 'Failed'];

  // Client-side filtering: search + status filter + type filter
  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;

    // Order type filter
    if (typeFilter !== 'ALL' && getOrderType(o) !== typeFilter) return false;

    // Search filter — match against id, customer name, child name, theme, email
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const searchableFields = [
        o.id,
        o.user?.firstName,
        o.user?.lastName,
        o.user?.email,
        o.childName,
        o.theme,
        o.email,
      ];
      const matches = searchableFields.some(
        (field) => field && String(field).toLowerCase().includes(q)
      );
      if (!matches) return false;
    }

    return true;
  });

  // Summary counts for quick-glance stats
  const typeCounts = {
    purchased: orders.filter((o) => getOrderType(o) === 'Purchased').length,
    preview: orders.filter((o) => getOrderType(o) === 'Preview Only').length,
    processing: orders.filter((o) => getOrderType(o) === 'Processing').length,
    failed: orders.filter((o) => getOrderType(o) === 'Failed').length,
  };

  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Child', 'Theme', 'Type', 'Status', 'Amount (₹)'];
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      o.user?.firstName || 'Guest',
      o.childName,
      o.theme,
      getOrderType(o),
      o.status,
      o.amountPaid ? (o.amountPaid / 100).toString() : '0',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell: string) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Purchased', count: typeCounts.purchased, emoji: '✅', filterVal: 'Purchased' },
          { label: 'Preview Only', count: typeCounts.preview, emoji: '👁️', filterVal: 'Preview Only' },
          { label: 'Processing', count: typeCounts.processing, emoji: '⏳', filterVal: 'Processing' },
          { label: 'Failed', count: typeCounts.failed, emoji: '❌', filterVal: 'Failed' },
        ].map((s) => (
          <div
            key={s.label}
            onClick={() => setTypeFilter(typeFilter === s.filterVal ? 'ALL' : s.filterVal)}
            style={{
              ...cardStyle,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 18px',
              border: typeFilter === s.filterVal ? '2px solid #c8a45c' : '1px solid #e8e4de',
              transition: 'border-color 0.15s',
            }}
          >
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1814' }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#8a8578' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & filter bar */}
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          id="admin-order-search"
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
          placeholder="Search by ID, customer, child, theme, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          id="admin-order-type-filter"
          style={selectStyle}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          {orderTypeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          id="admin-order-status-filter"
          style={selectStyle}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <>
            <span style={{ fontSize: 12, color: '#8a8578' }}>
              {filteredOrders.length} of {orders.length} orders
            </span>
            <button
              style={{ ...btnOutline, padding: '6px 12px', fontSize: 11 }}
              onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setTypeFilter('ALL'); }}
            >
              Clear Filters
            </button>
          </>
        )}
        <button style={btnPrimary} onClick={exportOrdersCSV}>Export CSV</button>
      </div>

      {/* Orders table */}
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Child</th>
              <th style={thStyle}>Theme</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8a8578' }}>
                {orders.length === 0 ? 'No orders found' : 'No orders match your search or filter'}
              </td></tr>
            ) : (
              filteredOrders.map((o) => {
                const orderType = getOrderType(o);
                return (
                  <tr key={o.id}>
                    <td style={{ ...tdStyle, fontWeight: 600, fontSize: 11 }}>{o.id.slice(0, 8)}...</td>
                    <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>{o.user?.firstName || 'Guest'}</td>
                    <td style={tdStyle}>{o.childName}</td>
                    <td style={tdStyle}>{o.theme}</td>
                    <td style={tdStyle}><span style={badge(orderType)}>{orderType}</span></td>
                    <td style={tdStyle}><span style={badge(o.status)}>{o.status.replace(/_/g, ' ')}</span></td>
                    <td style={tdStyle}>{o.amountPaid ? `₹${o.amountPaid/100}` : '—'}</td>
                    <td style={tdStyle}>
                      <button style={btnOutline} onClick={() => window.open(`/preview/${o.id}`, '_blank')}>View</button>
                    </td>
                  </tr>
                );
              })
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
    api.get('/pricing').then(res => {
      setPricing(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSavePricing = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await api.put('/pricing', pricing);
      setSaveMsg('Pricing saved successfully!');
    } catch (error) {
      console.error('Failed to save pricing:', error);
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
      const res = await api.get('/coupons');
      setCoupons(res.data);
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
      await api.post('/coupons', {
        code: newCoupon.code,
        name: newCoupon.code,
        type: newCoupon.type === 'Fixed Amount' ? 'flat' : 'percentage',
        value: parseInt(newCoupon.value),
        usageLimit: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : undefined,
        validTill: newCoupon.expiryDate ? new Date(newCoupon.expiryDate).toISOString() : undefined,
        minAmount: newCoupon.minOrder ? parseInt(newCoupon.minOrder) * 100 : undefined,
        syncWithRazorpay: newCoupon.syncWithRazorpay,
      });

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
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.message || 'Failed to create coupon';
      alert(`Error: ${msg}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
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

function UsersTab({ users, onRefresh }: { users: any[]; onRefresh: () => void }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleView = async (userId: string) => {
    setLoadingDetail(true);
    setSelectedUser(userId);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setUserDetail(res.data);
    } catch (e) {
      console.error('Failed to load user details:', e);
      alert('Failed to load user details');
      setSelectedUser(null);
    }
    setLoadingDetail(false);
  };

  const handleDeactivate = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their orders. This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      setSelectedUser(null);
      setUserDetail(null);
      onRefresh();
    } catch (e) {
      console.error('Failed to delete user:', e);
      alert('Failed to delete user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      onRefresh();
      if (userDetail && userDetail.id === userId) {
        setUserDetail({ ...userDetail, role: newRole });
      }
    } catch (e) {
      console.error('Failed to update role:', e);
      alert('Failed to update role');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* User detail modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => { setSelectedUser(null); setUserDetail(null); }}>
          <div style={{
            ...cardStyle, width: '90%', maxWidth: 700, maxHeight: '80vh',
            overflow: 'auto', position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            <button
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8a8578' }}
              onClick={() => { setSelectedUser(null); setUserDetail(null); }}
            >✕</button>

            {loadingDetail ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8a8578' }}>Loading user details...</div>
            ) : userDetail ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: '#1a1814',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 700,
                  }}>
                    {(userDetail.firstName?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{userDetail.firstName} {userDetail.lastName}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#8a8578' }}>{userDetail.email}</p>
                  </div>
                  <span style={{ ...badge(userDetail.role === 'ADMIN' ? 'ADMIN' : 'USER'), marginLeft: 'auto' }}>{userDetail.role}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div style={{ padding: 12, background: '#faf9f7', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{userDetail.orders?.length || 0}</div>
                    <div style={{ fontSize: 11, color: '#8a8578' }}>Orders</div>
                  </div>
                  <div style={{ padding: 12, background: '#faf9f7', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      ₹{((userDetail.orders || []).reduce((s: number, o: any) => s + (o.amountPaid || 0), 0) / 100).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 11, color: '#8a8578' }}>Total Spent</div>
                  </div>
                  <div style={{ padding: 12, background: '#faf9f7', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{userDetail.authProvider}</div>
                    <div style={{ fontSize: 11, color: '#8a8578' }}>Auth Provider</div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', letterSpacing: '0.5px' }}>Info</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6a6560', lineHeight: 2 }}>
                    <div><strong>ID:</strong> {userDetail.id}</div>
                    <div><strong>Phone:</strong> {userDetail.phone || '—'}</div>
                    <div><strong>Verified:</strong> {userDetail.isVerified ? 'Yes' : 'No'}</div>
                    <div><strong>Joined:</strong> {new Date(userDetail.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {userDetail.addresses?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', letterSpacing: '0.5px' }}>Addresses</span>
                    {userDetail.addresses.map((a: any) => (
                      <div key={a.id} style={{ fontSize: 12, color: '#6a6560', padding: '8px 0', borderBottom: '1px solid #f0ede8' }}>
                        <strong>{a.label}</strong>: {a.firstName} {a.lastName}, {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city}, {a.state} {a.postalCode}, {a.country}
                      </div>
                    ))}
                  </div>
                )}

                {userDetail.orders?.length > 0 && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', letterSpacing: '0.5px' }}>Orders</span>
                    <table style={{ ...tableStyle, marginTop: 8 }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Order ID</th>
                          <th style={thStyle}>Child</th>
                          <th style={thStyle}>Status</th>
                          <th style={thStyle}>Amount</th>
                          <th style={thStyle}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetail.orders.map((o: any) => (
                          <tr key={o.id}>
                            <td style={{ ...tdStyle, fontSize: 11, fontFamily: 'monospace' }}>{o.id.slice(0, 8)}...</td>
                            <td style={tdStyle}>{o.childName}</td>
                            <td style={tdStyle}><span style={badge(o.status)}>{o.status}</span></td>
                            <td style={tdStyle}>{o.amountPaid ? `₹${o.amountPaid / 100}` : '—'}</td>
                            <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button
                    style={btnPrimary}
                    onClick={() => handleRoleChange(userDetail.id, userDetail.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                  >
                    {userDetail.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                  </button>
                  <button
                    style={{ ...btnOutline, color: '#c47560' }}
                    onClick={() => handleDeactivate(userDetail.id, `${userDetail.firstName} ${userDetail.lastName}`)}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

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
                    <td style={tdStyle}><span style={badge(u.role === 'ADMIN' ? 'ADMIN' : 'USER')}>{u.role}</span></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={btnOutline} onClick={() => handleView(u.id)}>View</button>
                        <button
                          style={{ ...btnOutline, color: '#c47560' }}
                          onClick={() => handleDeactivate(u.id, `${u.firstName} ${u.lastName}`)}
                        >Delete</button>
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

function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/admin/messages');
      setMessages(res.data);
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      fetchMessages();
    } catch (e) {
      console.error('Failed to mark message as read:', e);
    }
  };

  if (loading) return <div style={cardStyle}>Loading messages...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Topic</th>
              <th style={thStyle}>Message</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>No messages found</td></tr>
            ) : (
              messages.map((m) => (
                <tr key={m.id} style={{ opacity: m.isRead ? 0.7 : 1 }}>
                  <td style={tdStyle}>{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td style={{ ...tdStyle, fontWeight: m.isRead ? 400 : 600 }}>{m.firstName} {m.lastName}</td>
                  <td style={tdStyle}>{m.email}</td>
                  <td style={tdStyle}>{m.topic}</td>
                  <td style={{ ...tdStyle, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</td>
                  <td style={tdStyle}>
                    <span style={badge(m.isRead ? 'USER' : 'Pending')}>
                      {m.isRead ? 'Read' : 'New'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {!m.isRead && (
                      <button style={btnOutline} onClick={() => markAsRead(m.id)}>
                        Mark as Read
                      </button>
                    )}
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

function BooksTab({ orders }: { orders: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const navigate = useNavigate();

  // Filter to only orders that have story/pages (i.e. actual books)
  const books = orders.filter((o) => o.storyJson || (o.pages && o.pages.length > 0));

  // Unique themes for filter dropdown
  const allThemes = [...new Set(books.map((b) => b.theme).filter(Boolean))];

  // Stats
  const totalBooks = books.length;
  const booksWithImages = books.filter((b) => b.pages?.some((p: any) => p.imageUrl)).length;
  const paidBooks = books.filter((b) => ['PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'].includes(b.status)).length;
  const previewReady = books.filter((b) => ['PREVIEW_READY', 'IMAGES_COMPLETE'].includes(b.status)).length;
  const failedBooks = books.filter((b) => b.status === 'FAILED').length;

  // Apply filters
  const filteredBooks = books.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (themeFilter && b.theme !== themeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = (b.storyJson?.title || '').toLowerCase();
      const child = (b.childName || '').toLowerCase();
      const user = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
      const id = b.id.toLowerCase();
      if (!title.includes(q) && !child.includes(q) && !user.includes(q) && !id.includes(q)) return false;
    }
    return true;
  });

  const statCards = [
    { emoji: '📚', label: 'Total Books', value: totalBooks, color: '#1a1814' },
    { emoji: '🖼️', label: 'With Images', value: booksWithImages, color: '#2a6cb8' },
    { emoji: '✅', label: 'Preview Ready', value: previewReady, color: '#3a7048' },
    { emoji: '💳', label: 'Purchased', value: paidBooks, color: '#9a7020' },
    { emoji: '❌', label: 'Failed', value: failedBooks, color: '#c47560' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#8a8578', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
          placeholder="Search by title, child name, user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {ALL_ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <select style={selectStyle} value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}>
          <option value="">All Themes</option>
          {allThemes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button
            style={{ ...btnOutline, padding: '6px 10px', background: viewMode === 'grid' ? '#1a1814' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#1a1814' }}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          </button>
          <button
            style={{ ...btnOutline, padding: '6px 10px', background: viewMode === 'table' ? '#1a1814' : 'transparent', color: viewMode === 'table' ? '#fff' : '#1a1814' }}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Book detail modal */}
      {selectedBook && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setSelectedBook(null)}>
          <div style={{
            ...cardStyle, width: '90%', maxWidth: 600, maxHeight: '80vh',
            overflow: 'auto', position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            <button
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8a8578' }}
              onClick={() => setSelectedBook(null)}
            >✕</button>

            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
              {/* Cover thumbnail */}
              <div style={{
                width: 120, height: 150, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                background: '#f0ede8',
              }}>
                {selectedBook.pages?.find((p: any) => p.imageUrl) ? (
                  <img
                    src={selectedBook.pages.find((p: any) => p.imageUrl).imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📖</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>
                  {selectedBook.storyJson?.title || `${selectedBook.childName}'s Adventure`}
                </h3>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#8a8578' }}>For {selectedBook.childName}</p>
                <span style={badge(selectedBook.status)}>{statusLabel(selectedBook.status)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 12, background: '#faf9f7', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedBook.pages?.length || 0}</div>
                <div style={{ fontSize: 11, color: '#8a8578' }}>Total Pages</div>
              </div>
              <div style={{ padding: 12, background: '#faf9f7', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedBook.pages?.filter((p: any) => p.imageUrl).length || 0}</div>
                <div style={{ fontSize: 11, color: '#8a8578' }}>With Images</div>
              </div>
              <div style={{ padding: 12, background: '#faf9f7', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedBook.amountPaid ? `₹${selectedBook.amountPaid / 100}` : '—'}</div>
                <div style={{ fontSize: 11, color: '#8a8578' }}>Revenue</div>
              </div>
            </div>

            <div style={{ fontSize: 13, color: '#6a6560', lineHeight: 2, marginBottom: 20 }}>
              <div><strong>Order ID:</strong> {selectedBook.id}</div>
              <div><strong>Child:</strong> {selectedBook.childName} ({selectedBook.childAge}y, {selectedBook.childGender})</div>
              <div><strong>Theme:</strong> {selectedBook.theme}</div>
              <div><strong>Customer:</strong> {selectedBook.user?.firstName} {selectedBook.user?.lastName} ({selectedBook.user?.email})</div>
              <div><strong>Created:</strong> {new Date(selectedBook.createdAt).toLocaleString()}</div>
              {selectedBook.paymentId && <div><strong>Payment ID:</strong> {selectedBook.paymentId}</div>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} onClick={() => window.open(`/preview/${selectedBook.id}`, '_blank')}>Open Preview</button>
              <button style={btnOutline} onClick={() => setSelectedBook(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div style={{ fontSize: 13, color: '#8a8578', paddingLeft: 4 }}>
        Showing {filteredBooks.length} of {totalBooks} books
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filteredBooks.length === 0 ? (
            <div style={{ ...cardStyle, gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#8a8578' }}>
              No books found matching your filters.
            </div>
          ) : (
            filteredBooks.map((book) => {
              const coverImg = book.pages?.find((p: any) => p.imageUrl)?.imageUrl;
              const title = book.storyJson?.title || `${book.childName}'s Adventure`;
              const pageCount = book.pages?.length || 0;
              const imageCount = book.pages?.filter((p: any) => p.imageUrl).length || 0;
              const isPurchased = ['PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'].includes(book.status);

              return (
                <div
                  key={book.id}
                  style={{
                    ...cardStyle,
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onClick={() => setSelectedBook(book)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Cover image */}
                  <div style={{ width: '100%', height: 160, overflow: 'hidden', position: 'relative', background: '#f0ede8' }}>
                    {coverImg ? (
                      <img src={coverImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#d5d0c8' }}>📖</div>
                    )}
                    {/* Status badge overlay */}
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <span style={badge(book.status)}>{statusLabel(book.status)}</span>
                    </div>
                    {isPurchased && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: '#3a7048', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Purchased
                      </div>
                    )}
                  </div>

                  {/* Card content */}
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1814', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 12, color: '#8a8578', marginBottom: 10 }}>
                      For <strong>{book.childName}</strong> &middot; {book.theme}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#8a8578' }}>
                        <span>📄 {pageCount} pages</span>
                        <span>🖼️ {imageCount} images</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#8a8578' }}>
                        {new Date(book.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div style={cardStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Cover</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Child</th>
                <th style={thStyle}>Theme</th>
                <th style={thStyle}>Pages</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>No books found</td></tr>
              ) : (
                filteredBooks.map((book) => {
                  const coverImg = book.pages?.find((p: any) => p.imageUrl)?.imageUrl;
                  const title = book.storyJson?.title || `${book.childName}'s Adventure`;

                  return (
                    <tr key={book.id}>
                      <td style={tdStyle}>
                        <div style={{ width: 40, height: 50, borderRadius: 4, overflow: 'hidden', background: '#f0ede8' }}>
                          {coverImg ? (
                            <img src={coverImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📖</div>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</td>
                      <td style={tdStyle}>{book.childName}</td>
                      <td style={tdStyle}>{book.theme}</td>
                      <td style={tdStyle}>{book.pages?.length || 0}</td>
                      <td style={tdStyle}><span style={badge(book.status)}>{statusLabel(book.status)}</span></td>
                      <td style={tdStyle}>{book.user?.firstName || 'Guest'}</td>
                      <td style={tdStyle}>{new Date(book.createdAt).toLocaleDateString()}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ ...btnOutline, padding: '4px 10px', fontSize: 12 }} onClick={() => setSelectedBook(book)}>Details</button>
                          <button style={{ ...btnOutline, padding: '4px 10px', fontSize: 12 }} onClick={() => window.open(`/preview/${book.id}`, '_blank')}>Preview</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function APITab() {
  return <div style={cardStyle}>API management coming soon...</div>;
}

function PaymentsTab({ orders }: { orders: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  // Only orders with a payment (amountPaid > 0 or paymentId set)
  const paidOrders = orders.filter((o) => o.amountPaid && o.amountPaid > 0);

  // Date filter
  const now = new Date();
  const dateFilteredOrders = paidOrders.filter((o) => {
    if (dateRange === 'all') return true;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 86400000);
    return new Date(o.createdAt) >= cutoff;
  });

  // Search + status filter
  const filteredTxns = dateFilteredOrders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        o.id.toLowerCase().includes(q) ||
        (o.paymentId || '').toLowerCase().includes(q) ||
        (o.razorpayOrderId || '').toLowerCase().includes(q) ||
        (o.childName || '').toLowerCase().includes(q) ||
        `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.toLowerCase().includes(q) ||
        (o.user?.email || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // KPIs
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.amountPaid || 0), 0) / 100;
  const totalTxns = paidOrders.length;
  const avgOrder = totalTxns > 0 ? totalRevenue / totalTxns : 0;
  const couponOrders = paidOrders.filter((o) => o.couponId);
  const totalDiscount = couponOrders.reduce((s, o) => s + (o.discountAmount || 0), 0) / 100;

  // Monthly revenue for the bar chart (last 6 months)
  const monthlyData: { label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    const rev = paidOrders
      .filter((o) => { const c = new Date(o.createdAt); return c >= d && c <= monthEnd; })
      .reduce((s, o) => s + (o.amountPaid || 0), 0) / 100;
    monthlyData.push({ label, revenue: rev });
  }
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  // Export CSV
  const exportPaymentsCSV = () => {
    const headers = ['Payment ID', 'Razorpay Order ID', 'Order ID', 'Date', 'Customer', 'Email', 'Child', 'Amount (₹)', 'Discount (₹)', 'Coupon', 'Status', 'Provider'];
    const rows = filteredTxns.map((o) => [
      o.paymentId || '',
      o.razorpayOrderId || '',
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || 'Guest',
      o.user?.email || o.email || '',
      o.childName || '',
      ((o.amountPaid || 0) / 100).toString(),
      ((o.discountAmount || 0) / 100).toString(),
      o.coupon?.code || '',
      o.status,
      o.paymentProvider || 'Razorpay',
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell: string) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const kpiCards = [
    { emoji: '💰', label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#3a7048' },
    { emoji: '🧾', label: 'Transactions', value: totalTxns.toString(), color: '#1a1814' },
    { emoji: '📊', label: 'Avg Order Value', value: `₹${avgOrder.toFixed(0)}`, color: '#2a6cb8' },
    { emoji: '🎟️', label: 'Coupons Used', value: `${couponOrders.length} (₹${totalDiscount.toLocaleString('en-IN')})`, color: '#9a7020' },
    { emoji: '📈', label: 'This Month', value: `₹${monthlyData[monthlyData.length - 1]?.revenue.toLocaleString('en-IN') || '0'}`, color: '#6e9973' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {kpiCards.map((k) => (
          <div key={k.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{k.emoji}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: '#8a8578', marginTop: 2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Monthly Revenue (Last 6 Months)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
          {monthlyData.map((m) => {
            const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1a1814' }}>
                  {m.revenue > 0 ? `₹${m.revenue.toLocaleString('en-IN')}` : '—'}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 64,
                    height: `${Math.max(pct, 4)}%`,
                    background: m.revenue > 0 ? 'linear-gradient(180deg, #c8a45c 0%, #a8843c 100%)' : '#e8e4de',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.4s ease',
                    minHeight: 4,
                  }}
                />
                <div style={{ fontSize: 10, color: '#8a8578', fontWeight: 500 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters + Search */}
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
          placeholder="Search by payment ID, customer, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select style={selectStyle} value={dateRange} onChange={(e) => setDateRange(e.target.value as any)}>
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['PAID', 'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED'].map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <button style={btnPrimary} onClick={exportPaymentsCSV}>Export CSV</button>
      </div>

      {/* Transaction detail modal */}
      {selectedTxn && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setSelectedTxn(null)}>
          <div style={{
            ...cardStyle, width: '90%', maxWidth: 580, maxHeight: '80vh',
            overflow: 'auto', position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            <button
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8a8578' }}
              onClick={() => setSelectedTxn(null)}
            >✕</button>

            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Payment Details</h3>

            {/* Amount hero */}
            <div style={{
              textAlign: 'center', padding: '20px 0 24px',
              borderBottom: '1px solid #f0ede8', marginBottom: 20,
            }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#3a7048' }}>
                ₹{((selectedTxn.amountPaid || 0) / 100).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 13, color: '#8a8578', marginTop: 4 }}>
                {selectedTxn.currency || 'INR'} • {new Date(selectedTxn.createdAt).toLocaleString()}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={badge(selectedTxn.status)}>{statusLabel(selectedTxn.status)}</span>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13, color: '#6a6560', lineHeight: 2, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', marginBottom: 4 }}>Payment Info</div>
                <div><strong>Payment ID:</strong> {selectedTxn.paymentId || '—'}</div>
                <div><strong>Razorpay Order:</strong> {selectedTxn.razorpayOrderId || '—'}</div>
                <div><strong>Provider:</strong> {selectedTxn.paymentProvider || 'Razorpay'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', marginBottom: 4 }}>Customer</div>
                <div><strong>Name:</strong> {selectedTxn.user?.firstName} {selectedTxn.user?.lastName}</div>
                <div><strong>Email:</strong> {selectedTxn.user?.email || selectedTxn.email || '—'}</div>
                <div><strong>Book:</strong> {selectedTxn.childName}'s story</div>
              </div>
            </div>

            {/* Coupon info */}
            {selectedTxn.couponId && (
              <div style={{
                padding: '12px 16px', background: '#faf8f3', borderRadius: 8,
                border: '1px solid #efebe3', marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', marginBottom: 6 }}>Coupon Applied</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#9a7020' }}>
                    {selectedTxn.coupon?.code || selectedTxn.couponId.slice(0, 8)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3a7048' }}>
                    -₹{((selectedTxn.discountAmount || 0) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} onClick={() => window.open(`/preview/${selectedTxn.id}`, '_blank')}>View Book</button>
              <button style={btnOutline} onClick={() => setSelectedTxn(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div style={{ fontSize: 13, color: '#8a8578', paddingLeft: 4 }}>
        Showing {filteredTxns.length} of {paidOrders.length} transactions
      </div>

      {/* Transactions Table */}
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Payment ID</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Book</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Discount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxns.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8a8578' }}>No transactions found</td></tr>
            ) : (
              filteredTxns.map((o) => (
                <tr key={o.id}>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                    {o.paymentId ? `${o.paymentId.slice(0, 16)}...` : '—'}
                  </td>
                  <td style={tdStyle}>
                    <div>{o.user?.firstName || 'Guest'} {o.user?.lastName || ''}</div>
                    <div style={{ fontSize: 11, color: '#8a8578' }}>{o.user?.email || o.email || ''}</div>
                  </td>
                  <td style={tdStyle}>{o.childName}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#3a7048' }}>₹{((o.amountPaid || 0) / 100).toLocaleString('en-IN')}</td>
                  <td style={tdStyle}>
                    {o.discountAmount ? (
                      <span style={{ color: '#9a7020', fontWeight: 500 }}>-₹{(o.discountAmount / 100).toLocaleString('en-IN')}</span>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}><span style={badge(o.status)}>{statusLabel(o.status)}</span></td>
                  <td style={tdStyle}>
                    <button style={{ ...btnOutline, padding: '4px 10px', fontSize: 12 }} onClick={() => setSelectedTxn(o)}>Details</button>
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoadDone = useRef(false);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    }
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/admin/stats').then(res => res.data),
        api.get('/admin/orders').then(res => res.data),
        api.get('/admin/users').then(res => res.data),
      ]);
      setStats(statsRes);
      setOrders(ordersRes);
      setUsers(usersRes);
      if (isInitial) setError(null);
    } catch (e: any) {
      console.error('Admin data fetch failed:', e);
      if (isInitial) {
        if (e.response?.status === 403 || e.response?.status === 401) {
          setError('Unauthorized: Admin access required');
        } else {
          setError('Failed to load dashboard data');
        }
      }
    }
    if (isInitial) setLoading(false);
  }, []);

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

    // Initial fetch
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchData(true);
    }

    // Start polling for real-time updates
    pollRef.current = setInterval(() => fetchData(false), POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, user, navigate, authLoading, fetchData]);

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
      case 'users': return <UsersTab users={users} onRefresh={() => fetchData(false)} />;
      case 'books': return <BooksTab orders={orders} />;
      case 'payments': return <PaymentsTab orders={orders} />;
      case 'messages': return <MessagesTab />;
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
