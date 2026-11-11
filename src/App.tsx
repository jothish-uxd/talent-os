import { Link, Navigate, Route, Routes } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import { usePageTitle } from './components/usePageTitle';
import HiringApp from './pages/hiring/HiringApp';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <AppHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/hiring-system" replace />} />
        <Route path="/hiring-system/*" element={<HiringApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  const h = usePageTitle('Page not found');
  return (
    <main id="main" className="main main--solo">
      <h1 ref={h} tabIndex={-1} className="page-title">This page doesn’t exist</h1>
      <p className="page-lede">Go back to the <Link to="/hiring-system">hiring system</Link>.</p>
    </main>
  );
}
