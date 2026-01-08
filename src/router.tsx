import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import MarketDashboard from './pages/MarketDashboard';
import IndexDetail from './pages/IndexDetail';
import NewsPage from './pages/NewsPage';
import IdeasPage from './pages/IdeasPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'markets',
        element: <MarketDashboard />,
      },
      {
        path: 'indices/:symbol',
        element: <IndexDetail />,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'ideas',
        element: <IdeasPage />,
      },
    ],
  },
]);

