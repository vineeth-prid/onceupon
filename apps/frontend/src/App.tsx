import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PersonalizePage } from './pages/PersonalizePage';
import { ProgressPage } from './pages/ProgressPage';
import { PreviewPage } from './pages/PreviewPage';
import { CreatePage } from './pages/CreatePage';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

function Header() {
  const location = useLocation();
  const isPreview = location.pathname.startsWith('/preview');
  if (isPreview) return null;

  return (
    <header className="w-full bg-white relative z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-6">
        {/* Logo */}
        <Link to="/" className="no-underline">
          <span
            className="font-display text-3xl tracking-tight"
            style={{ color: '#000000' }}
          >
            Once Upon a Time
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="no-underline text-sm font-body transition-colors"
            style={{ color: location.pathname === '/' ? '#000000' : '#6F6F6F' }}
          >
            Home
          </Link>
          <Link
            to="/create"
            className="no-underline text-sm font-body transition-colors"
            style={{ color: location.pathname === '/create' ? '#000000' : '#6F6F6F' }}
          >
            Books
          </Link>
          <Link
            to="/create"
            className="rounded-full text-sm font-body no-underline transition-transform hover:scale-[1.03] inline-block"
            style={{
              backgroundColor: '#000000',
              color: '#FFFFFF',
              padding: '0.625rem 1.5rem',
            }}
          >
            Create a Book
          </Link>
        </nav>
      </div>
    </header>
  );
}

function GlobalSections() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isPreview = location.pathname.startsWith('/preview');

  if (isHome || isPreview) return null;

  return (
    <>
      <FAQ />
      <Footer />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div className="font-body" style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/personalize/:bookId" element={<PersonalizePage />} />
            <Route path="/progress/:orderId" element={<ProgressPage />} />
            <Route path="/preview/:orderId" element={<PreviewPage />} />
          </Routes>
        </main>
        <GlobalSections />
      </div>
    </BrowserRouter>
  );
}
