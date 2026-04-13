import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1.5px solid #e5e5e5',
  borderRadius: 10,
  fontSize: '0.9rem',
  fontFamily: 'Inter, sans-serif',
  color: '#000',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
  backgroundColor: '#fff',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#6F6F6F',
  display: 'block',
  marginBottom: 6,
};

const btnStyle = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '0.8rem',
  backgroundColor: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: 100,
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.7 : 1,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  transition: 'opacity 0.2s',
});

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notAdmin = (location.state as any)?.notAdmin;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState(
    notAdmin ? 'Access denied. This account does not have admin privileges.' : ''
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();

  // If already logged in as admin, redirect immediately
  if (user?.role === 'ADMIN') {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/admin/reset-password', { email, newPassword });
      setSuccessMessage('Password updated successfully. Please sign in with your new password.');
      setIsForgotPassword(false);
      setNewPassword('');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Check your email is correct.');
    } finally {
      setLoading(false);
    }
  };

  const switchToForgot = () => {
    setIsForgotPassword(true);
    setError('');
    setSuccessMessage('');
  };

  const switchToLogin = () => {
    setIsForgotPassword(false);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: '100vh', padding: '2rem 1rem', backgroundColor: '#FAFAFA' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" className="no-underline">
            <span className="font-display text-2xl" style={{ color: '#000' }}>
              Once Upon a Time
            </span>
          </Link>
        </div>

        {/* Admin Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: 100,
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Admin Portal
          </span>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div
            style={{
              padding: '0.7rem 1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: '#166534',
              marginBottom: '1rem',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            style={{
              padding: '0.7rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: '#dc2626',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <h2
          className="font-display"
          style={{ fontSize: '1.8rem', fontWeight: 400, color: '#000', marginBottom: '1.5rem' }}
        >
          {isForgotPassword ? 'Reset Password.' : 'Admin Sign In.'}
        </h2>

        {/* ── FORGOT PASSWORD FORM ── */}
        {isForgotPassword ? (
          <form onSubmit={handleResetPassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '1.2rem' }}>
              <div>
                <label className="font-body" style={labelStyle}>Admin Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="saravananmk45@gmail.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#000')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                />
              </div>
              <div>
                <label className="font-body" style={labelStyle}>New Password</label>
                <input
                  id="reset-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#000')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                />
              </div>
            </div>

            <button id="admin-reset-btn" type="submit" disabled={loading} className="font-body" style={btnStyle(loading)}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={switchToLogin}
                className="font-body"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6F6F6F',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* ── LOGIN FORM ── */
          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '1rem' }}>
              <div>
                <label className="font-body" style={labelStyle}>Admin Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Here"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#000')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                />
              </div>
              <div>
                <label className="font-body" style={labelStyle}>Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password Here"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#000')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                />
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem' }}>
              <span
                className="font-body"
                onClick={switchToForgot}
                style={{ fontSize: '0.78rem', color: '#6F6F6F', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot password?
              </span>
            </div>

            <button id="admin-login-btn" type="submit" disabled={loading} className="font-body" style={btnStyle(loading)}>
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
        )}

        {/* Back to site */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/"
            className="font-body"
            style={{ fontSize: '0.78rem', color: '#6F6F6F', textDecoration: 'none' }}
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
