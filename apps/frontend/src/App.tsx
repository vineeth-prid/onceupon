import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PersonalizePage } from './pages/PersonalizePage';
import { ProgressPage } from './pages/ProgressPage';
import { PreviewPage } from './pages/PreviewPage';

function Header() {
  const location = useLocation();
  const isPreview = location.pathname.startsWith('/preview');
  if (isPreview) return null;

  return (
    <header style={{
      padding: '0.8rem 2rem',
      background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1a0533 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 20px rgba(26, 5, 51, 0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.5px',
        }}>
          Once Upon a Time
        </span>
      </a>
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <a href="/" style={{
          textDecoration: 'none',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'color 0.2s',
        }}>
          Home
        </a>
        <a href="/" style={{
          textDecoration: 'none',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          Books
        </a>
      </nav>
    </header>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div className="app" style={{
        fontFamily: "'Nunito', sans-serif",
        minHeight: '100vh',
        background: '#FFF9F0',
      }}>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/personalize/:themeId" element={<PersonalizePage />} />
            <Route path="/progress/:orderId" element={<ProgressPage />} />
            <Route path="/preview/:orderId" element={<PreviewPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
