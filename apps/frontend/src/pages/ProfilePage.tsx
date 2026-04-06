import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Tab = 'books' | 'orders' | 'details' | 'notifications' | 'addresses';

const tabs: { key: Tab; label: string }[] = [
  { key: 'books', label: 'My Books' },
  { key: 'orders', label: 'Orders' },
  { key: 'details', label: 'Personal Details' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'addresses', label: 'Saved Addresses' },
];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('books');

  const initial = user?.firstName?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="font-body" style={{ minHeight: '80vh', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div className="profile-layout" style={{ display: 'flex', gap: 48 }}>

          {/* Sidebar */}
          <aside className="profile-sidebar" style={{ width: 240, flexShrink: 0 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF', fontSize: 28, fontWeight: 600, marginBottom: 12,
              }}>
                {initial}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 13, color: '#6F6F6F' }}>{user?.email}</div>
            </div>

            {/* Nav */}
            <div className="profile-nav" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '10px 16px', borderRadius: 8, border: 'none', textAlign: 'left',
                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    background: activeTab === tab.key ? '#000' : 'transparent',
                    color: activeTab === tab.key ? '#FFF' : '#000',
                  }}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                style={{
                  padding: '10px 16px', borderRadius: 8, border: 'none', textAlign: 'left',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  background: 'transparent', color: '#6F6F6F', marginTop: 12,
                }}
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {activeTab === 'books' && <BooksTab navigate={navigate} />}
            {activeTab === 'orders' && <OrdersTab navigate={navigate} />}
            {activeTab === 'details' && <DetailsTab user={user} />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'addresses' && <AddressesTab />}
          </main>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .profile-layout {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .profile-sidebar {
            width: 100% !important;
          }
          .profile-nav {
            flex-direction: row !important;
            overflow-x: auto;
            gap: 8px !important;
          }
          .profile-nav button {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}

/* ======== Tab: My Books ======== */
function BooksTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const books = [
    { id: '1', title: 'The Enchanted Adventure', pages: 24, style: 'Disney / Pixar', thumb: '#000' },
    { id: '2', title: 'Journey to the Stars', pages: 16, style: 'Disney / Pixar', thumb: '#000' },
  ];

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 24px' }}>My Books</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {books.map((book) => (
          <div key={book.id} style={{
            border: '1px solid #E0E0E0', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
          }}>
            <div style={{ height: 160, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 4 }}>{book.title}</div>
              <div style={{ fontSize: 12, color: '#6F6F6F' }}>{book.pages} pages &middot; {book.style}</div>
            </div>
          </div>
        ))}

        {/* Create new book card */}
        <div
          onClick={() => navigate('/create')}
          style={{
            border: '2px dashed #E0E0E0', borderRadius: 12, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 220, cursor: 'pointer', padding: 24,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: '50%', border: '2px dashed #6F6F6F',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6F6F6F" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#6F6F6F' }}>Create new book</span>
        </div>
      </div>
    </div>
  );
}

/* ======== Tab: Orders ======== */
function OrdersTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const orders = [
    { id: '10421', title: 'The Enchanted Adventure', date: 'Apr 7, 2026', status: 'Generating', price: '$34.99' },
    { id: '10308', title: 'Journey to the Stars', date: 'Mar 22, 2026', status: 'Delivered', price: '$34.99' },
  ];

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 24px' }}>Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/tracking/${order.id}`)}
            style={{
              border: '1px solid #E0E0E0', borderRadius: 12, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer',
              background: '#FAFAFA',
            }}
          >
            {/* Book icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 8, background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 2 }}>{order.title}</div>
              <div style={{ fontSize: 12, color: '#6F6F6F' }}>
                #OAT-2026-{order.id} &middot; {order.date}
              </div>
            </div>
            <div style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: order.status === 'Delivered' ? '#000' : '#FFF',
              color: order.status === 'Delivered' ? '#FFF' : '#000',
              border: order.status === 'Delivered' ? 'none' : '1px solid #000',
            }}>
              {order.status}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{order.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======== Tab: Personal Details ======== */
function DetailsTab({ user }: { user: { firstName?: string; lastName?: string; email?: string } | null }) {
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E0E0E0',
    fontSize: 14, color: '#000', background: '#FAFAFA', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 24px' }}>Personal Details</h2>
      <div style={{ maxWidth: 480 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Field label="First Name">
            <input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last Name">
            <input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
        </div>
        <Field label="Email" style={{ marginBottom: 16 }}>
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Phone" style={{ marginBottom: 16 }}>
          <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
        </Field>
        <Field label="New Password" style={{ marginBottom: 28 }}>
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
        </Field>
        <button style={{
          padding: '12px 32px', borderRadius: 8, border: 'none',
          background: '#000', color: '#FFF', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 12, color: '#6F6F6F', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ======== Tab: Notifications ======== */
function NotificationsTab() {
  const items = [
    { key: 'gen', title: 'Book generation complete', subtitle: 'Get notified when your book is ready to preview.' },
    { key: 'dispatch', title: 'Order dispatched', subtitle: 'Get notified when your order ships.' },
    { key: 'deliver', title: 'Order delivered', subtitle: 'Get notified when your order arrives.' },
    { key: 'draft', title: 'Draft reminder', subtitle: 'Reminder about unfinished book drafts.' },
    { key: 'promo', title: 'Promotions & offers', subtitle: 'Receive special offers and discounts.' },
  ];

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    gen: true, dispatch: true, deliver: true, draft: false, promo: false,
  });

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 24px' }}>Notifications</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item) => (
          <div key={item.key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 0', borderBottom: '1px solid #E0E0E0',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#000', marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#6F6F6F' }}>{item.subtitle}</div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setToggles((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: toggles[item.key] ? '#000' : '#E0E0E0',
                position: 'relative', padding: 0, flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#FFF',
                position: 'absolute', top: 3,
                left: toggles[item.key] ? 23 : 3,
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======== Tab: Saved Addresses ======== */
function AddressesTab() {
  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 24px' }}>Saved Addresses</h2>
      <div style={{
        border: '1px solid #E0E0E0', borderRadius: 12, padding: '24px',
        background: '#FAFAFA', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: '#000', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Default
          </span>
        </div>
        <div style={{ fontSize: 15, color: '#000', lineHeight: 1.6 }}>
          123 Storybook Lane<br />
          San Francisco, CA 94102<br />
          United States
        </div>
      </div>
      <button style={{
        padding: '12px 28px', borderRadius: 8, border: '1px solid #000',
        background: '#FFF', color: '#000', fontSize: 14, fontWeight: 500, cursor: 'pointer',
      }}>
        Add New Address
      </button>
    </div>
  );
}
