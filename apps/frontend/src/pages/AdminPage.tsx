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
  | 'payments'
  | 'messages';

const tabPaths: Record<Tab, string> = {
  dashboard: '/admin',
  orders: '/admin/orders',
  pricing: '/admin/pricing',
  coupons: '/admin/coupons',
  users: '/admin/users',
  books: '/admin/books',
  payments: '/admin/payments',
  messages: '/admin/messages',
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
      { id: 'messages', label: 'Messages', emoji: '✉️' },
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
  messages: { title: 'Messages', subtitle: 'Customer inquiries and feedback' },
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
    ORDER_CONFIRMED: { bg: '#6e997310', color: '#3a7048' },
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

/* ── Polling interval in milliseconds ── */
const POLL_INTERVAL_MS = 30_000;


/* ── Tab Components ── */

function DashboardTab({ stats, onNavigate }: { stats: any; onNavigate?: (tab: Tab) => void }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const displayStats = [
    { emoji: '📦', label: 'Total Orders', value: stats?.totalOrders?.toString() || '0', delta: stats?.deltas?.orders || '+0%', up: true },
    { emoji: '💰', label: 'Total Revenue', value: stats?.revenue ? `₹${stats.revenue.toLocaleString()}` : '₹0', delta: stats?.deltas?.revenue || '+0%', up: true },
    { emoji: '👥', label: 'Registered Users', value: stats?.totalUsers?.toString() || '0', delta: stats?.deltas?.users || '+0%', up: true },
    { emoji: '📚', label: 'Books Generated', value: stats?.booksGenerated?.toString() || '0', delta: stats?.deltas?.books || '+0%', up: true },
    { emoji: '⭐', label: 'Avg Rating', value: '4.92', delta: '+0.03', up: true },
    { emoji: '📈', label: 'Conversion Rate', value: '23.4%', delta: '-1.2%', up: false },
  ];

  const handleProcessPending = async () => {
    setLoadingAction('process');
    try {
      const res = await api.post('/admin/actions/process-pending');
      const { processed, orderIds } = res.data;
      if (processed === 0) {
        toast.success('No pending orders to process');
      } else {
        toast.success(`Queued ${processed} pending order${processed > 1 ? 's' : ''} for processing`);
      }
      console.log('Processed order IDs:', orderIds);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process pending orders');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRetryFailed = async () => {
    setLoadingAction('retry');
    try {
      const res = await api.post('/admin/actions/retry-failed');
      const { retried, orderIds } = res.data;
      if (retried === 0) {
        toast.success('No failed orders to retry');
      } else {
        toast.success(`Retrying ${retried} failed order${retried > 1 ? 's' : ''}`);
      }
      console.log('Retried order IDs:', orderIds);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retry failed generations');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendBulkNotification = async () => {
    if (!confirm('Send book-ready notification emails to all users with completed orders?')) return;
    setLoadingAction('notify');
    try {
      const res = await api.post('/admin/actions/send-bulk-notification');
      const { sent, failed } = res.data;
      if (sent === 0 && failed === 0) {
        toast.success('No completed orders with emails to notify');
      } else {
        toast.success(`Sent ${sent} notification${sent !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send bulk notifications');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdatePricing = () => {
    onNavigate?.('pricing');
  };

  const handleCreateCoupon = () => {
    onNavigate?.('coupons');
  };

  const handleExportReport = async () => {
    setLoadingAction('export');
    try {
      const res = await api.get('/admin/actions/export-report', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly_report_${new Date().toISOString().slice(0, 7)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Monthly report exported successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to export report');
    } finally {
      setLoadingAction(null);
    }
  };

  const quickActions: { key: string; label: string; handler: () => void }[] = [
    { key: 'process', label: '📦 Process Pending Orders', handler: handleProcessPending },
    { key: 'retry', label: '🔄 Retry Failed Generations', handler: handleRetryFailed },
    { key: 'notify', label: '📧 Send Bulk Notification', handler: handleSendBulkNotification },
    { key: 'pricing', label: '💰 Update Pricing', handler: handleUpdatePricing },
    { key: 'coupons', label: '🎟️ Create Coupon Code', handler: handleCreateCoupon },
    { key: 'export', label: '📊 Export Monthly Report', handler: handleExportReport },
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
              <button
                key={a.key}
                onClick={a.handler}
                disabled={loadingAction !== null}
                style={{
                  ...btnOutline,
                  textAlign: 'left',
                  padding: '10px 14px',
                  opacity: loadingAction !== null && loadingAction !== a.key ? 0.5 : 1,
                  cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingAction === a.key ? `⏳ ${a.label.slice(2)}...` : a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Created',
  STORY_GENERATING: 'Story Generating',
  STORY_COMPLETE: 'Story Complete',
  IMAGES_GENERATING: 'Images Generating',
  IMAGES_COMPLETE: 'Images Complete',
  PDF_GENERATING: 'PDF Generating',
  PREVIEW_READY: 'Preview Ready',
  PAID: 'Paid',
  ORDER_CONFIRMED: 'Order Confirmed',
  PRINTING: 'Printing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const ALL_ORDER_STATUSES = [
  'CREATED', 'STORY_GENERATING', 'STORY_COMPLETE', 'IMAGES_GENERATING',
  'IMAGES_COMPLETE', 'PDF_GENERATING', 'PREVIEW_READY', 'PAID',
  'ORDER_CONFIRMED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'FAILED',
];

function OrdersTab({ orders }: { orders: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        o.id.toLowerCase().includes(q) ||
        (o.user?.firstName || '').toLowerCase().includes(q) ||
        (o.user?.lastName || '').toLowerCase().includes(q) ||
        (o.childName || '').toLowerCase().includes(q) ||
        (o.theme || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const exportOrdersCSV = () => {
    const headers = [
      'Order ID', 'Date', 'Customer', 'Child', 'Theme', 'Status', 'Amount (₹)',
      'Shipping Name', 'Shipping Email', 'Shipping Phone',
      'Address Line 1', 'Address Line 2', 'City', 'State', 'Postcode', 'Country'
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      o.user?.firstName || 'Guest',
      o.childName,
      o.theme,
      statusLabel(o.status),
      o.amountPaid ? (o.amountPaid / 100).toString() : '0',
      o.shippingName || '',
      o.email || '',
      o.shippingPhone || '',
      o.shippingLine1 || '',
      o.shippingLine2 || '',
      o.shippingCity || '',
      o.shippingState || '',
      o.shippingPostal || '',
      o.shippingCountry || ''
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
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            ...cardStyle, width: '90%', maxWidth: 600, maxHeight: '80vh',
            overflow: 'auto', position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            <button
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8a8578' }}
              onClick={() => setSelectedOrder(null)}
            >✕</button>
            
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Order Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', display: 'block', marginBottom: 4 }}>Order ID</label>
                <div style={{ fontSize: 14 }}>{selectedOrder.id}</div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', display: 'block', marginBottom: 4 }}>Status</label>
                <div><span style={badge(selectedOrder.status)}>{selectedOrder.status}</span></div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', display: 'block', marginBottom: 4 }}>Date</label>
                <div style={{ fontSize: 14 }}>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#8a8578', display: 'block', marginBottom: 4 }}>Amount</label>
                <div style={{ fontSize: 14 }}>₹{selectedOrder.amountPaid ? selectedOrder.amountPaid / 100 : 0}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0ede8', paddingTop: 20, marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Shipping Information</h4>
              {!selectedOrder.shippingName ? (
                <div style={{ fontSize: 13, color: '#8a8578', fontStyle: 'italic' }}>No shipping information provided (Digital only)</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#8a8578' }}>Name</label>
                    <div style={{ fontSize: 13 }}>{selectedOrder.shippingName}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#8a8578' }}>Phone</label>
                    <div style={{ fontSize: 13 }}>{selectedOrder.shippingPhone}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, color: '#8a8578' }}>Email</label>
                    <div style={{ fontSize: 13 }}>{selectedOrder.email || '—'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, color: '#8a8578' }}>Address</label>
                    <div style={{ fontSize: 13 }}>
                      {selectedOrder.shippingLine1}<br />
                      {selectedOrder.shippingLine2 && <>{selectedOrder.shippingLine2}<br /></>}
                      {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostal}<br />
                      {selectedOrder.shippingCountry}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #f0ede8', paddingTop: 20 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Book Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#8a8578' }}>Child Name</label>
                  <div style={{ fontSize: 13 }}>{selectedOrder.childName} ({selectedOrder.childAge}y, {selectedOrder.childGender})</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8a8578' }}>Theme</label>
                  <div style={{ fontSize: 13 }}>{selectedOrder.theme}</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
              <button style={btnPrimary} onClick={() => window.open(`/preview/${selectedOrder.id}`, '_blank')}>Open Book Preview</button>
              <button style={btnOutline} onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          style={selectStyle}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {ALL_ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <button style={btnPrimary} onClick={exportOrdersCSV}>Export CSV</button>
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
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: 40 }}>No orders found</td></tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: 11 }}>{o.id.slice(0, 8)}...</td>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>{o.user?.firstName || 'Guest'}</td>
                  <td style={tdStyle}>{o.childName}</td>
                  <td style={tdStyle}>{o.theme}</td>
                  <td style={tdStyle}><span style={badge(o.status)}>{statusLabel(o.status)}</span></td>
                  <td style={tdStyle}>{o.amountPaid ? `₹${o.amountPaid/100}` : '₹0'}</td>
                  <td style={tdStyle}>
                    <button style={{ ...btnOutline, padding: '4px 10px', fontSize: 12 }} onClick={() => setSelectedOrder(o)}>Details</button>
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

type PricingField = {
  label: string;
  key: 'premadeStartingPrice' | 'customStartingPrice' | 'ebookPrice' | 'physicalPrice' | 'shippingPrice';
  hint: string;
};

type PricingSection = {
  title: string;
  emoji: string;
  description: string;
  fields: PricingField[];
};

const PRICING_SECTIONS: PricingSection[] = [
  {
    title: 'Catalog Starting Prices',
    emoji: '\u{1F3F7}\ufe0f',
    description: 'Lowest "From \u20b9X" price shown on storefront cards. Updates reflect instantly on every book listing.',
    fields: [
      {
        label: 'Pre-made Books',
        key: 'premadeStartingPrice',
        hint: 'Shown on /templates book cards & detail pages.',
      },
      {
        label: 'Custom Creation',
        key: 'customStartingPrice',
        hint: 'Shown on /create and the Occasion Gallery cards.',
      },
    ],
  },
  {
    title: 'After-Generation Pricing',
    emoji: '\u{1F4DA}',
    description: 'Charged after the book is generated, when the customer chooses how to receive it.',
    fields: [
      {
        label: 'eBook Download',
        key: 'ebookPrice',
        hint: 'Unlock the digital PDF on the preview page.',
      },
      {
        label: 'Physical Book',
        key: 'physicalPrice',
        hint: 'Print + ship a hardcover copy.',
      },
    ],
  },
  {
    title: 'Shipping & Tax',
    emoji: '\u{1F69A}',
    description: 'Delivery and applicable taxes added to the order total.',
    fields: [
      {
        label: 'Standard Shipping',
        key: 'shippingPrice',
        hint: 'Default shipping fee at checkout.',
      },
    ],
  },
];

function PricingNumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      <span
        style={{
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          background: '#f0ede8',
          border: '1px solid #d5d0c8',
          borderRight: 'none',
          borderRadius: '10px 0 0 10px',
          fontSize: 14,
          fontWeight: 600,
          color: '#5b554c',
        }}
      >
        {'\u20b9'}
      </span>
      <input
        style={{
          ...inputStyle,
          borderRadius: '0 10px 10px 0',
          width: 130,
          fontSize: 14,
          fontWeight: 600,
          textAlign: 'right',
          padding: '10px 14px',
        }}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        type="number"
        min={0}
      />
    </div>
  );
}

function PricingTab() {
  const [pricing, setPricing] = useState({
    premadeStartingPrice: 499,
    customStartingPrice: 499,
    ebookPrice: 499,
    physicalPrice: 1299,
    shippingPrice: 99,
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pricing').then(res => {
      setPricing((p) => ({ ...p, ...res.data }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSavePricing = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await api.put('/pricing', pricing);
      setPricing((p) => ({ ...p, ...res.data }));
      setSaveMsg({ kind: 'success', text: 'Pricing saved \u2014 all storefront prices updated.' });
    } catch (error) {
      console.error('Failed to save pricing:', error);
      setSaveMsg({ kind: 'error', text: 'Failed to save pricing. Please try again.' });
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 4000);
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={{ fontSize: 13, color: '#8a8578' }}>Loading pricing\u2026</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 880 }}>
      {PRICING_SECTIONS.map((section) => (
        <div key={section.title} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#f7f4ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {section.emoji}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#1a1814' }}>
                {section.title}
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: '#8a8578', lineHeight: 1.5 }}>
                {section.description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {section.fields.map((field) => (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '12px 14px',
                  background: '#fbfaf7',
                  border: '1px solid #efebe3',
                  borderRadius: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1814', marginBottom: 2 }}>
                    {field.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#8a8578' }}>{field.hint}</div>
                </div>
                <PricingNumberInput
                  value={pricing[field.key]}
                  onChange={(n) => setPricing({ ...pricing, [field.key]: n })}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div
        style={{
          ...cardStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          position: 'sticky',
          bottom: 16,
          background: '#fff',
        }}
      >
        <div style={{ fontSize: 13, color: saveMsg?.kind === 'error' ? '#c47560' : '#3a7048', minHeight: 18 }}>
          {saveMsg?.text || ''}
        </div>
        <button
          style={{ ...btnPrimary, padding: '12px 28px', fontSize: 14, opacity: saving ? 0.7 : 1 }}
          onClick={handleSavePricing}
          disabled={saving}
        >
          {saving ? 'Saving\u2026' : 'Save All Pricing'}
        </button>
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
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  const handleAvatarClick = useCallback(() => {
    if (!avatarMenuOpen) {
      updateMenuPosition();
    }
    setAvatarMenuOpen((prev) => !prev);
  }, [avatarMenuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarMenuOpen]);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleReposition = () => updateMenuPosition();
    window.addEventListener('scroll', handleReposition, { passive: true });
    window.addEventListener('resize', handleReposition, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleReposition);
      window.removeEventListener('resize', handleReposition);
    };
  }, [avatarMenuOpen, updateMenuPosition]);

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
      case 'dashboard': return <DashboardTab stats={stats} onNavigate={setActiveTab} />;
      case 'orders': return <OrdersTab orders={orders} />;
      case 'pricing': return <PricingTab />;
      case 'coupons': return <CouponsTab />;
      case 'users': return <UsersTab users={users} onRefresh={() => fetchData(false)} />;
      case 'books': return <BooksTab />;
      case 'payments': return <PaymentsTab />;
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
          <button
            ref={avatarRef}
            onClick={handleAvatarClick}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#1a1814',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {user?.firstName?.[0]?.toUpperCase() || 'A'}
          </button>
        </header>

        {avatarMenuOpen && menuPos && (
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              minWidth: 180,
              background: '#fff',
              borderRadius: 12,
              padding: '8px 0',
              zIndex: 9999,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1814' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 12, color: '#8a8578' }}>
                {user?.email}
              </div>
            </div>
            
            <button
              onClick={() => {
                setAvatarMenuOpen(false);
                navigate('/');
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#1a1814',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Back to Website
            </button>
            <button
              onClick={() => {
                setAvatarMenuOpen(false);
                navigate('/profile');
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#1a1814',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              My Profile
            </button>
            <button
              onClick={() => {
                setAvatarMenuOpen(false);
                logout();
                navigate('/login');
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#e74c3c',
                borderTop: '1px solid rgba(0,0,0,0.06)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#fcf0f0')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Log Out
            </button>
          </div>
        )}

        {renderTab()}
      </main>
    </div>
  );
}
