import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import StockChatbotFAB from './StockChatbotFAB';

export default function Layout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-brand-dark text-gray-100">
      <Header />
      <main className={!isLandingPage ? 'pt-20' : ''}>
        <Outlet />
      </main>
      <Footer />
      <StockChatbotFAB />
    </div>
  );
}
