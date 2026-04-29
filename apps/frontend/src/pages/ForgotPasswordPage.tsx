import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message || 'If your email is registered, a reset link will be sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 12,
    fontSize: '0.95rem',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#1a1a1a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    backgroundColor: '#fafafa',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#444',
    display: 'block',
    marginBottom: 8,
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF5F2 0%, #FFF 40%, #F8F6FF 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Reset Password
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            color: '#888',
            margin: '8px 0 0',
          }}>
            Enter your email to receive a password reset link.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 12,
              fontSize: '0.9rem',
              color: '#065F46',
              marginBottom: 24,
              fontFamily: "'Inter', sans-serif",
            }}>
              {message}
            </div>
            <Link to="/login" style={{
              display: 'inline-block',
              width: '100%',
              padding: '14px',
              backgroundColor: '#f5f5f5',
              color: '#1a1a1a',
              textDecoration: 'none',
              borderRadius: 14,
              fontSize: '0.92rem',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                fontSize: '0.84rem',
                color: '#DC2626',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: "'Inter', sans-serif",
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>!</span>
                {message}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#E86B4A',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: '0.92rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {status === 'loading' ? 'Sending link...' : 'Send Reset Link'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/login" style={{
                fontSize: '0.85rem',
                color: '#888',
                textDecoration: 'none',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}>
                &larr; Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
