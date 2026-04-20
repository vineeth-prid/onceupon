import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function NavBar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const isPreview = location.pathname.startsWith('/preview');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAvatarMenuOpen(false);
  }, [location.pathname]);

  if (isPreview) return null;

  const navLinks = [
    { to: '/templates', label: 'Books' },
    { to: '/create', label: 'Custom' },
    { to: '/about', label: 'About' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'liquid-glass-strong' : ''}`}
        style={{
          backgroundColor: scrolled ? undefined : 'transparent',
          borderBottom: scrolled ? 'none' : '1px solid transparent',
          padding: scrolled ? '0.75rem 0' : '1.1rem 0',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8">
          <Link to="/" className="no-underline">
            <span className="font-display text-2xl md:text-3xl tracking-tight" style={{ color: '#000' }}>
              Once Upon a Time
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="no-underline text-xs font-body uppercase transition-colors"
                style={{
                  color: isActive(link.to) ? '#000000' : '#6F6F6F',
                  letterSpacing: '0.12em',
                }}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="flex items-center justify-center rounded-full transition-transform hover:scale-105 liquid-glass"
                  style={{
                    width: 36,
                    height: 36,
                    color: '#000',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </button>
                {avatarMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 rounded-xl liquid-glass-strong"
                    style={{
                      minWidth: 180,
                      padding: '0.5rem 0',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div className="font-body text-sm font-medium" style={{ color: '#000' }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="font-body text-xs" style={{ color: '#6F6F6F' }}>
                        {user?.email}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block no-underline font-body text-sm px-4 py-2 transition-colors"
                      style={{ color: '#000' }}
                      onClick={() => setAvatarMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile?tab=books"
                      className="block no-underline font-body text-sm px-4 py-2 transition-colors"
                      style={{ color: '#000' }}
                      onClick={() => setAvatarMenuOpen(false)}
                    >
                      My Books
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="block no-underline font-body text-sm px-4 py-2 transition-colors"
                        style={{ color: '#000', borderTop: '1px solid rgba(0,0,0,0.06)' }}
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setAvatarMenuOpen(false); }}
                      className="block w-full text-left font-body text-sm px-4 py-2 transition-colors border-none bg-transparent cursor-pointer"
                      style={{ color: '#6F6F6F', borderTop: '1px solid rgba(0,0,0,0.06)' }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="no-underline font-body text-xs uppercase transition-colors"
                  style={{ color: '#6F6F6F', letterSpacing: '0.12em' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/admin/login"
                  className="no-underline font-body text-xs uppercase transition-colors"
                  style={{ color: '#6F6F6F', letterSpacing: '0.12em' }}
                >
                  Admin
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ display: 'block', width: 22, height: 2, backgroundColor: '#000', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 22, height: 2, backgroundColor: '#000', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 16, height: 2, backgroundColor: '#000', borderRadius: 2 }} />
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: scrolled ? 60 : 72 }} />

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center liquid-glass-strong"
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-5 text-2xl bg-transparent border-none cursor-pointer"
            style={{ color: '#000' }}
            aria-label="Close menu"
          >
            ✕
          </button>
          <nav className="flex flex-col items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="no-underline font-display text-2xl transition-colors"
                style={{ color: isActive(link.to) ? '#000' : '#6F6F6F' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ width: 40, height: 1, backgroundColor: 'rgba(0,0,0,0.1)', margin: '0.5rem 0' }} />
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="no-underline font-display text-2xl"
                  style={{ color: '#000' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="font-display text-2xl bg-transparent border-none cursor-pointer"
                  style={{ color: '#6F6F6F' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="no-underline font-display text-2xl"
                  style={{ color: '#000' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/admin/login"
                  className="no-underline font-display text-2xl"
                  style={{ color: '#6F6F6F' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </Link>
              </>
            )}

          </nav>
        </div>
      )}
    </>
  );
}
