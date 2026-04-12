import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllOrders } from '../api/orders';
import { BOOK_TEMPLATES, CATEGORIES } from '@bookmagic/shared';

type Tab = 'books' | 'orders' | 'details' | 'notifications' | 'addresses';

const tabs: { key: Tab; label: string }[] = [
  { key: 'books', label: 'My Books' },
  { key: 'orders', label: 'Orders' },
  { key: 'details', label: 'Personal Details' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'addresses', label: 'Saved Addresses' },
];

const VALID_TABS = new Set<string>(tabs.map((t) => t.key));

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: Tab = tabParam && VALID_TABS.has(tabParam) ? (tabParam as Tab) : 'books';

  const setActiveTab = (tab: Tab) => {
    setSearchParams({ tab });
  };

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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  useEffect(() => {
    getAllOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedOrders = orders.filter(
    (o: any) => o.pages && o.pages.length > 0 && o.pages.some((p: any) => p.imageUrl),
  );

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 8px' }}>My Books</h2>
      <p style={{ fontSize: 14, color: '#6F6F6F', margin: '0 0 24px' }}>
        {loading ? 'Loading...' : `${completedOrders.length} book${completedOrders.length !== 1 ? 's' : ''} created`}
      </p>

      {!loading && completedOrders.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px', background: '#FAFAFA',
          borderRadius: 16, border: '1px solid #E0E0E0',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <p style={{ fontSize: 16, color: '#6F6F6F', marginBottom: 20 }}>
            You haven't created any books yet.
          </p>
          <button
            onClick={() => navigate('/create')}
            style={{
              padding: '12px 32px', borderRadius: 8, border: 'none',
              background: '#000', color: '#FFF', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Create Your First Book
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 20,
      }}>
        {completedOrders.map((order: any) => {
          const coverImage = order.pages?.find((p: any) => p.imageUrl)?.imageUrl;
          const isHovered = hoveredBook === order.id;
          const bookTemplate = BOOK_TEMPLATES.find((t) => t.id === order.theme);
          const category = bookTemplate
            ? CATEGORIES.find((c) => c.id === bookTemplate.categoryId)
            : null;
          const accentColor = category?.color || '#000';

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/preview/${order.id}`)}
              onMouseEnter={() => setHoveredBook(order.id)}
              onMouseLeave={() => setHoveredBook(null)}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: isHovered
                  ? '0 16px 40px rgba(0,0,0,0.18)'
                  : '0 4px 16px rgba(0,0,0,0.08)',
                background: '#fff',
              }}
            >
              <div style={{
                width: '100%', height: 200, overflow: 'hidden', position: 'relative',
              }}>
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={order.childName}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                  }}>
                    {category?.icon || '📖'}
                  </div>
                )}
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: accentColor, color: '#fff',
                  padding: '3px 10px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}>
                  {bookTemplate?.name || order.theme}
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 4 }}>
                  {order.storyJson?.title || `${order.childName}'s Adventure`}
                </div>
                <div style={{ fontSize: 12, color: '#6F6F6F', marginBottom: 8 }}>
                  For {order.childName} &middot; {order.pages?.length || 0} pages
                </div>
                <div style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: 50,
                  background: isHovered ? '#000' : '#f0f0f0',
                  color: isHovered ? '#fff' : '#000',
                  fontWeight: 600, fontSize: 12, transition: 'all 0.3s ease',
                }}>
                  Read Book
                </div>
              </div>
            </div>
          );
        })}

        {/* Create new book card */}
        {!loading && (
          <div
            onClick={() => navigate('/create')}
            style={{
              border: '2px dashed #E0E0E0', borderRadius: 16, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 280, cursor: 'pointer', padding: 24,
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#000')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E0E0E0')}
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
        )}
      </div>
    </div>
  );
}

/* ======== Tab: Orders ======== */
function OrdersTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusDisplay = (status: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      CREATED: { label: 'Created', bg: '#FFF', color: '#000' },
      STORY_GENERATING: { label: 'Generating', bg: '#FFF3E0', color: '#E65100' },
      STORY_COMPLETE: { label: 'Story Ready', bg: '#E8F5E9', color: '#2E7D32' },
      IMAGES_GENERATING: { label: 'Generating', bg: '#FFF3E0', color: '#E65100' },
      IMAGES_COMPLETE: { label: 'Images Ready', bg: '#E8F5E9', color: '#2E7D32' },
      PDF_GENERATING: { label: 'Generating', bg: '#FFF3E0', color: '#E65100' },
      PREVIEW_READY: { label: 'Preview Ready', bg: '#E3F2FD', color: '#1565C0' },
      PAYMENT_PENDING: { label: 'Payment Pending', bg: '#FFF3E0', color: '#E65100' },
      PAID: { label: 'Paid', bg: '#E8F5E9', color: '#2E7D32' },
      PRINTING: { label: 'Printing', bg: '#F3E5F5', color: '#7B1FA2' },
      SHIPPED: { label: 'Shipped', bg: '#E3F2FD', color: '#1565C0' },
      DELIVERED: { label: 'Delivered', bg: '#000', color: '#FFF' },
      FAILED: { label: 'Failed', bg: '#FFEBEE', color: '#C62828' },
    };
    return map[status] || { label: status, bg: '#F5F5F5', color: '#000' };
  };

  const getOrderType = (order: any): 'ebook' | 'print' => {
    if (order.shippingName || order.shippingLine1 || order.trackingNumber) {
      return 'print';
    }
    return 'ebook';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const formatPrice = (amount: number | null) => {
    if (!amount) return '--';
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div>
        <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 24px' }}>Orders</h2>
        <p style={{ color: '#6F6F6F' }}>Loading orders...</p>
      </div>
    );
  }

  // Filter to only orders that have progressed past creation (have a story or payment)
  const paidOrders = orders.filter((o) =>
    ['PAID', 'PRINTING', 'SHIPPED', 'DELIVERED'].includes(o.status),
  );
  const activeOrders = orders.filter((o) =>
    !['PAID', 'PRINTING', 'SHIPPED', 'DELIVERED', 'FAILED'].includes(o.status)
    && o.pages && o.pages.length > 0,
  );

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 28, color: '#000', margin: '0 0 24px' }}>Orders</h2>

      {orders.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px', background: '#FAFAFA',
          borderRadius: 16, border: '1px solid #E0E0E0',
        }}>
          <p style={{ fontSize: 16, color: '#6F6F6F' }}>No orders yet.</p>
        </div>
      )}

      {/* Active / In-Progress orders */}
      {activeOrders.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            In Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const coverImage = order.pages?.find((p: any) => p.imageUrl)?.imageUrl;
              return (
                <div
                  key={order.id}
                  onClick={() => {
                    if (['PREVIEW_READY', 'IMAGES_COMPLETE'].includes(order.status)) {
                      navigate(`/preview/${order.id}`);
                    } else {
                      navigate(`/progress/${order.id}`);
                    }
                  }}
                  style={{
                    border: '1px solid #E0E0E0', borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                    background: '#FAFAFA', transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                    background: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {coverImage ? (
                      <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.storyJson?.title || `${order.childName}'s Adventure`}
                    </div>
                    <div style={{ fontSize: 12, color: '#6F6F6F' }}>
                      For {order.childName} &middot; {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: statusInfo.bg, color: statusInfo.color,
                    border: statusInfo.bg === '#FFF' ? '1px solid #E0E0E0' : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    {statusInfo.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paid / Completed orders */}
      {paidOrders.length > 0 && (
        <div>
          {activeOrders.length > 0 && (
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Purchased
            </h3>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paidOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const orderType = getOrderType(order);
              const coverImage = order.pages?.find((p: any) => p.imageUrl)?.imageUrl;
              const isEbook = orderType === 'ebook';

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(isEbook ? `/preview/${order.id}` : `/tracking/${order.id}`)}
                  style={{
                    border: '1px solid #E0E0E0', borderRadius: 12, padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer',
                    background: '#FAFAFA', transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Order type icon */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                    position: 'relative',
                  }}>
                    {coverImage ? (
                      <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', borderRadius: 10,
                        background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="1.5">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Type badge */}
                    <div style={{
                      position: 'absolute', bottom: -4, right: -4,
                      width: 22, height: 22, borderRadius: '50%',
                      background: isEbook ? '#1565C0' : '#7B1FA2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #fff',
                    }}>
                      {isEbook ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <line x1="9" y1="6" x2="15" y2="6" />
                          <line x1="9" y1="10" x2="15" y2="10" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.storyJson?.title || `${order.childName}'s Adventure`}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                        background: isEbook ? '#E3F2FD' : '#F3E5F5',
                        color: isEbook ? '#1565C0' : '#7B1FA2',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        flexShrink: 0,
                      }}>
                        {isEbook ? 'eBook' : 'Print'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6F6F6F' }}>
                      #{order.id.slice(0, 8).toUpperCase()} &middot; {formatDate(order.createdAt)}
                      {!isEbook && order.trackingNumber && (
                        <> &middot; Tracking: {order.trackingNumber}</>
                      )}
                    </div>
                  </div>

                  <div style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: statusInfo.bg, color: statusInfo.color,
                    border: statusInfo.bg === '#FFF' ? '1px solid #E0E0E0' : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    {statusInfo.label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#000', whiteSpace: 'nowrap' }}>
                    {formatPrice(order.amountPaid)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
