import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { PersonalizePage } from './pages/PersonalizePage';
import { ProgressPage } from './pages/ProgressPage';
import { PreviewPage } from './pages/PreviewPage';
import { CreatePage } from './pages/CreatePage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { TrackingPage } from './pages/TrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { NavBar } from './components/NavBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { Footer } from './components/Footer';

function ConditionalNavBar() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <NavBar />;
}


function GlobalSections() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isPreview = location.pathname.startsWith('/preview');
  const isLogin = location.pathname === '/login';
  const isAdmin = location.pathname.startsWith('/admin');

  if (isHome || isPreview || isLogin || isAdmin) return null;

  return (
    <>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="font-body" style={{ minHeight: '100vh', background: '#FFFFFF' }}>
          <ConditionalNavBar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/books/:slug" element={<BookDetailPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute><CreatePage /></ProtectedRoute>
              } />
              <Route path="/personalize/:bookId" element={
                <ProtectedRoute><PersonalizePage /></ProtectedRoute>
              } />
              <Route path="/progress/:orderId" element={
                <ProtectedRoute><ProgressPage /></ProtectedRoute>
              } />
              <Route path="/preview/:orderId" element={<PreviewPage />} />
              <Route path="/checkout/:orderId" element={
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              } />
              <Route path="/confirmation/:orderId" element={
                <ProtectedRoute><ConfirmationPage /></ProtectedRoute>
              } />
              <Route path="/tracking/:orderId" element={
                <ProtectedRoute><TrackingPage /></ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <AdminProtectedRoute><AdminPage /></AdminProtectedRoute>
              } />
            </Routes>
          </main>
          <GlobalSections />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
