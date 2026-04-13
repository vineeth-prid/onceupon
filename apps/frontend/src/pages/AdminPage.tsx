import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Tab =
  | 'dashboard'
  | 'orders'
  | 'pricing'
  | 'coupons'
  | 'users'
  | 'books'
  | 'api'
  | 'payments'
  | 'notifications'
  | 'settings'
  | 'audit';

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
      { id: 'api', label: 'API', emoji: '🔌' },
      { id: 'payments', label: 'Payments', emoji: '💳' },
      { id: 'notifications', label: 'Notifications', emoji: '🔔' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', label: 'Site Settings', emoji: '⚙️' },
      { id: 'audit', label: 'Audit Logs', emoji: '📋' },
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
  api: { title: 'API Management', subtitle: 'Third-party integrations & keys' },
  payments: { title: 'Payments', subtitle: 'Transaction history & analytics' },
  notifications: { title: 'Notifications', subtitle: 'Messaging & automated triggers' },
  settings: { title: 'Site Settings', subtitle: 'Platform configuration' },
  audit: { title: 'Audit Logs', subtitle: 'Admin activity history' },
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
    Generating: { bg: '#c8a45c10', color: '#9a7020' },
    Printing: { bg: '#4a90d910', color: '#2a6cb8' },
    Dispatched: { bg: '#5bc0de10', color: '#31708f' },
    Shipped: { bg: '#5bc0de10', color: '#31708f' },
    Delivered: { bg: '#6e997310', color: '#3a7048' },
    Active: { bg: '#6e997310', color: '#3a7048' },
    Success: { bg: '#6e997310', color: '#3a7048' },
    Captured: { bg: '#6e997310', color: '#3a7048' },
    Completed: { bg: '#6e997310', color: '#3a7048' },
    Failed: { bg: '#c4756010', color: '#c47560' },
    Expired: { bg: '#c4756010', color: '#c47560' },
    Refunded: { bg: '#c4756010', color: '#c47560' },
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
  const stats = [
    { emoji: '📦', label: 'Total Orders', value: '1,247', delta: '+12.3%', up: true },
    { emoji: '💰', label: 'Revenue MTD', value: '₹69,98,560', delta: '+8.1%', up: true },
    { emoji: '👥', label: 'Registered Users', value: '3,891', delta: '+15.7%', up: true },
    { emoji: '📚', label: 'Books Generated', value: '5,024', delta: '+22.4%', up: true },
    { emoji: '⭐', label: 'Avg Rating', value: '4.92', delta: '+0.03', up: true },
    { emoji: '📈', label: 'Conversion Rate', value: '23.4%', delta: '-1.2%', up: false },
  ];

  const recentOrders = [
    { id: 'ORD-4821', customer: 'Priya Sharma', format: 'Premium Print', status: 'Printing', amount: '₹2,499' },
    { id: 'ORD-4820', customer: 'Rahul Mehta', format: 'eBook', status: 'Delivered', amount: '₹499' },
    { id: 'ORD-4819', customer: 'Anita Desai', format: 'Classic Print', status: 'Dispatched', amount: '₹1,299' },
    { id: 'ORD-4818', customer: 'Vikram Patel', format: 'Grand Print', status: 'Generating', amount: '₹3,999' },
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
        {stats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#8a8578' }}>{s.label}</div>
              </div>
              <span style={{ fontSize: 28 }}>{s.emoji}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: s.up ? '#3a7048' : '#c47560', fontWeight: 600 }}>
              {s.up ? '↑' : '↓'} {s.delta}
            </div>
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
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{o.id}</td>
                  <td style={tdStyle}>{o.customer}</td>
                  <td style={tdStyle}>{o.format}</td>
                  <td style={tdStyle}><span style={badge(o.status)}>{o.status}</span></td>
                  <td style={tdStyle}>{o.amount}</td>
                  <td style={tdStyle}><button style={btnOutline}>View</button></td>
                </tr>
              ))}
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
  const orders = [
    { id: 'ORD-4821', date: '2026-04-07', customer: 'Priya Sharma', book: 'Dino Adventure', format: 'Premium Print', delivery: 'Express', status: 'Printing', total: '₹2,499' },
    { id: 'ORD-4820', date: '2026-04-06', customer: 'Rahul Mehta', book: 'Space Journey', format: 'eBook', delivery: 'Instant', status: 'Delivered', total: '₹499' },
    { id: 'ORD-4819', date: '2026-04-06', customer: 'Anita Desai', book: 'Fairy Garden', format: 'Classic Print', delivery: 'Standard', status: 'Dispatched', total: '₹1,299' },
    { id: 'ORD-4818', date: '2026-04-05', customer: 'Vikram Patel', book: 'Ocean Quest', format: 'Grand Print', delivery: 'Priority', status: 'Generating', total: '₹3,999' },
    { id: 'ORD-4817', date: '2026-04-05', customer: 'Meera Iyer', book: 'Jungle Safari', format: 'Premium Print', delivery: 'Express', status: 'Failed', total: '₹2,499' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Search orders..." />
        <select style={selectStyle}>
          <option>All Statuses</option>
          <option>Generating</option>
          <option>Printing</option>
          <option>Dispatched</option>
          <option>Delivered</option>
          <option>Failed</option>
        </select>
        <select style={selectStyle}>
          <option>All Formats</option>
          <option>eBook</option>
          <option>Classic Print</option>
          <option>Premium Print</option>
          <option>Grand Print</option>
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
              <th style={thStyle}>Book</th>
              <th style={thStyle}>Format</th>
              <th style={thStyle}>Delivery</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{o.id}</td>
                <td style={tdStyle}>{o.date}</td>
                <td style={tdStyle}>{o.customer}</td>
                <td style={tdStyle}>{o.book}</td>
                <td style={tdStyle}>{o.format}</td>
                <td style={tdStyle}>{o.delivery}</td>
                <td style={tdStyle}><span style={badge(o.status)}>{o.status}</span></td>
                <td style={tdStyle}>{o.total}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={btnOutline}>View</button>
                    <button style={{ ...btnOutline, color: '#c47560' }}>Refund</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button style={btnOutline}>Prev</button>
          <span style={{ fontSize: 13, color: '#8a8578' }}>Page 1 of 208</span>
          <button style={btnOutline}>Next</button>
        </div>
      </div>
    </div>
  );
}

function PricingTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Product Pricing</h3>
        {[
          { label: 'AI Creation Fee', value: '199' },
          { label: 'eBook Price', value: '499' },
          { label: 'Print Classic', value: '1299' },
          { label: 'Print Premium', value: '2499' },
          { label: 'Print Grand', value: '3999' },
          { label: 'Gift Packaging', value: '299' },
        ].map((f) => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <label style={{ flex: 1, fontSize: 13, color: '#1a1814' }}>{f.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ padding: '8px 10px', background: '#f0ede8', border: '1px solid #d5d0c8', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#8a8578' }}>₹</span>
              <input style={{ ...inputStyle, borderRadius: '0 8px 8px 0', width: 100 }} defaultValue={f.value} />
            </div>
          </div>
        ))}
        <button style={{ ...btnPrimary, marginTop: 8, width: '100%' }}>Save Pricing</button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Shipping & Tax</h3>
        {[
          { label: 'Standard Delivery', value: '99', prefix: '₹' },
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
        <button style={{ ...btnPrimary, marginTop: 8, width: '100%' }}>Save Shipping & Tax</button>
      </div>
    </div>
  );
}

function CouponsTab() {
  const coupons = [
    { code: 'WELCOME20', type: 'Percentage', value: '20%', used: 342, max: 1000, expiry: '2026-06-30', status: 'Active' },
    { code: 'FLAT500', type: 'Fixed', value: '₹500', used: 89, max: 200, expiry: '2026-05-15', status: 'Active' },
    { code: 'DIWALI50', type: 'Percentage', value: '50%', used: 500, max: 500, expiry: '2025-11-15', status: 'Expired' },
    { code: 'FREESHIP', type: 'Free Shipping', value: '100%', used: 1204, max: 5000, expiry: '2026-12-31', status: 'Active' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Create Coupon</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Code</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="e.g. SUMMER25" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Discount Type</label>
            <select style={{ ...selectStyle, width: '100%', boxSizing: 'border-box' }}>
              <option>Percentage</option>
              <option>Fixed Amount</option>
              <option>Free Shipping</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Value</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="e.g. 25" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Max Uses</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="e.g. 500" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Expiry Date</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} type="date" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Min Order</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="e.g. 999" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button style={btnPrimary}>Create Coupon</button>
          <button style={btnOutline}>Auto-Generate Code</button>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Active Coupons</h3>
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
            {coupons.map((c) => (
              <tr key={c.code}>
                <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'monospace' }}>{c.code}</td>
                <td style={tdStyle}>{c.type}</td>
                <td style={tdStyle}>{c.value}</td>
                <td style={tdStyle}>{c.used}</td>
                <td style={tdStyle}>{c.max}</td>
                <td style={tdStyle}>{c.expiry}</td>
                <td style={tdStyle}><span style={badge(c.status)}>{c.status}</span></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={btnOutline}>Edit</button>
                    <button style={{ ...btnOutline, color: '#c47560' }}>Delete</button>
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

function APITab() {
  const StatusDot = ({ color }: { color: string }) => (
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 8 }} />
  );

  const cards = [
    {
      title: 'AI Generation',
      color: '#3a7048',
      fields: [
        { label: 'API Key', value: 'r8_****************************3kF9', type: 'text' },
        { label: 'Model', value: 'photomaker-style', type: 'select', options: ['photomaker-style', 'flux-pulid', 'sdxl'] },
        { label: 'Monthly Budget Cap', value: '50000', type: 'text', prefix: '₹' },
      ],
      stats: [
        { label: 'API Calls (MTD)', value: '12,847' },
        { label: 'Cost (MTD)', value: '₹34,290' },
        { label: 'Avg Latency', value: '8.2s' },
      ],
    },
    {
      title: 'Payment Gateway',
      color: '#3a7048',
      fields: [
        { label: 'Key ID', value: 'rzp_live_****8kF2', type: 'text' },
        { label: 'Key Secret', value: '****************************', type: 'text' },
        { label: 'Mode', value: 'Live', type: 'select', options: ['Live', 'Sandbox'] },
      ],
      stats: [
        { label: 'Volume (MTD)', value: '₹69,98,560' },
        { label: 'Decline Rate', value: '2.1%' },
        { label: 'Uptime', value: '99.98%' },
      ],
    },
    {
      title: 'Print Partner',
      color: '#3a7048',
      fields: [
        { label: 'API Key', value: 'lulu_****************************xK2', type: 'text' },
        { label: 'Store ID', value: 'BOOKMAGIC-IN-001', type: 'text' },
        { label: 'Mode', value: 'Production', type: 'select', options: ['Production', 'Sandbox'] },
      ],
      stats: [],
    },
    {
      title: 'Email & SMS',
      color: '#3a7048',
      fields: [
        { label: 'SendGrid Key', value: 'SG.****************************mN4', type: 'text' },
        { label: 'From Email', value: 'hello@onceuponatime.in', type: 'text' },
        { label: 'Twilio Token', value: '****************************', type: 'text' },
      ],
      stats: [],
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {cards.map((c) => (
        <div key={c.title} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <StatusDot color={c.color} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{c.title}</h3>
          </div>
          {c.fields.map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <label style={{ width: 120, fontSize: 12, color: '#8a8578', flexShrink: 0 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select style={{ ...selectStyle, flex: 1 }} defaultValue={f.value}>
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                  {f.prefix && (
                    <span style={{ padding: '8px 10px', background: '#f0ede8', border: '1px solid #d5d0c8', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#8a8578' }}>{f.prefix}</span>
                  )}
                  <input style={{ ...inputStyle, flex: 1, borderRadius: f.prefix ? '0 8px 8px 0' : 8, fontFamily: 'monospace', fontSize: 12 }} defaultValue={f.value} />
                </div>
              )}
            </div>
          ))}
          {c.stats.length > 0 && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e4de' }}>
              {c.stats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1814' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#8a8578' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
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

function NotificationsTab() {
  const [triggers, setTriggers] = useState<Record<string, boolean>>({
    bookComplete: true,
    orderConfirmation: true,
    sentToPrint: true,
    dispatched: true,
    delivered: true,
    ebookDownload: true,
    abandonedDraft: false,
    reviewRequest: true,
  });

  const triggerLabels: Record<string, string> = {
    bookComplete: 'Book generation complete',
    orderConfirmation: 'Order confirmation',
    sentToPrint: 'Sent to print partner',
    dispatched: 'Order dispatched',
    delivered: 'Order delivered',
    ebookDownload: 'eBook ready for download',
    abandonedDraft: 'Abandoned draft (48h)',
    reviewRequest: 'Review request (7 days post-delivery)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Send Notification</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Audience</label>
          <select style={{ ...selectStyle, width: '100%', boxSizing: 'border-box' }}>
            <option>All Users</option>
            <option>Active Users (30 days)</option>
            <option>Users with Pending Orders</option>
            <option>Users with Abandoned Drafts</option>
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Channel</label>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Email', 'Push', 'SMS'].map((ch) => (
              <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={ch === 'Email'} /> {ch}
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Subject</label>
          <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="Notification subject..." />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Message</label>
          <textarea
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', minHeight: 100, resize: 'vertical' as const }}
            placeholder="Write your message..."
          />
        </div>
        <button style={{ ...btnPrimary, width: '100%' }}>Send Notification</button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Automated Triggers</h3>
        {Object.entries(triggerLabels).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0ede8' }}>
            <span style={{ fontSize: 13, color: '#1a1814' }}>{label}</span>
            <button
              onClick={() => setTriggers((prev) => ({ ...prev, [key]: !prev[key] }))}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                background: triggers[key] ? '#3a7048' : '#d5d0c8',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: triggers[key] ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Site Settings</h3>
        {[
          { label: 'Site Name', value: 'Once Upon a Time', type: 'text' },
          { label: 'Support Email', value: 'support@onceuponatime.in', type: 'text' },
          { label: 'Max Photos per Book', value: '5', type: 'text' },
          { label: 'Max Regenerations', value: '3', type: 'text' },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} defaultValue={f.value} />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: '#1a1814' }}>Maintenance Mode</span>
          <button style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: '#d5d0c8', cursor: 'pointer', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
          </button>
        </div>
        <button style={{ ...btnPrimary, width: '100%' }}>Save Settings</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Google OAuth</h3>
          {[
            { label: 'Client ID', value: '******.apps.googleusercontent.com' },
            { label: 'Client Secret', value: 'GOCSPX-****************************' },
            { label: 'Redirect URI', value: 'https://onceuponatime.in/auth/callback' },
            { label: 'Apple Client ID', value: 'com.onceuponatime.auth' },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: 12 }} defaultValue={f.value} />
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Admin Access</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Admin Email</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} defaultValue="admin@onceuponatime.in" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#1a1814' }}>Two-Factor Authentication</span>
            <button style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: '#3a7048', cursor: 'pointer', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 3, left: 23, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
            </button>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#8a8578', display: 'block', marginBottom: 6 }}>Session Timeout (minutes)</label>
            <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} defaultValue="30" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditTab() {
  const logs = [
    { timestamp: '2026-04-07 14:32:01', admin: 'admin@onceuponatime.in', action: 'Update Pricing', resource: 'Premium Print', ip: '103.42.18.201', result: 'Success' },
    { timestamp: '2026-04-07 13:15:44', admin: 'admin@onceuponatime.in', action: 'Create Coupon', resource: 'SUMMER25', ip: '103.42.18.201', result: 'Success' },
    { timestamp: '2026-04-07 11:02:18', admin: 'admin@onceuponatime.in', action: 'Suspend User', resource: 'USR-004', ip: '103.42.18.201', result: 'Success' },
    { timestamp: '2026-04-06 18:45:33', admin: 'admin@onceuponatime.in', action: 'Refund Order', resource: 'ORD-4819', ip: '103.42.18.201', result: 'Success' },
    { timestamp: '2026-04-06 16:20:09', admin: 'admin@onceuponatime.in', action: 'Update API Key', resource: 'Replicate', ip: '103.42.18.201', result: 'Failed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} placeholder="Search logs..." />
        <select style={selectStyle}>
          <option>All Actions</option>
          <option>Update Pricing</option>
          <option>Create Coupon</option>
          <option>Suspend User</option>
          <option>Refund Order</option>
          <option>Update API Key</option>
        </select>
        <input style={inputStyle} type="date" />
        <button style={btnPrimary}>Export</button>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Admin</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Resource</th>
              <th style={thStyle}>IP</th>
              <th style={thStyle}>Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{l.timestamp}</td>
                <td style={tdStyle}>{l.admin}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{l.action}</td>
                <td style={tdStyle}>{l.resource}</td>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{l.ip}</td>
                <td style={tdStyle}><span style={badge(l.result)}>{l.result}</span></td>
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
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'orders': return <OrdersTab />;
      case 'pricing': return <PricingTab />;
      case 'coupons': return <CouponsTab />;
      case 'users': return <UsersTab />;
      case 'books': return <BooksTab />;
      case 'api': return <APITab />;
      case 'payments': return <PaymentsTab />;
      case 'notifications': return <NotificationsTab />;
      case 'settings': return <SettingsTab />;
      case 'audit': return <AuditTab />;
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
                      onClick={() => setActiveTab(item.id)}
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
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 16px',
                  background: 'transparent',
                  border: '1px solid #d5d0c8',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'Inter, sans-serif',
                  color: '#8a8578',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
              <div 
                title={user?.email || 'Admin'}
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
                }}
              >
                {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
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
