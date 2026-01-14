import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import MarketDashboard from './pages/MarketDashboard';
import IndexDetail from './pages/IndexDetail';
import NewsPage from './pages/NewsPage';
import IdeasPage from './pages/IdeasPage';
import IdeaDetail from './pages/IdeaDetail';
import NewsDetail from './pages/NewsDetail';
import SearchResults from './pages/SearchResults';
import ChartEditor from './pages/ChartEditor';
import AdminPanel from './pages/AdminPanel';

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
        path: 'stocks/:symbol',
        element: <IndexDetail />,
      },
      {
        path: 'chart/:symbol',
        element: <ChartEditor />,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'news/:id',
        element: <NewsDetail />,
      },
      {
        path: 'ideas',
        element: <IdeasPage />,
      },
      {
        path: 'ideas/:id',
        element: <IdeaDetail />,
      },
      {
        path: 'search',
        element: <SearchResults />,
      },
      {
        path: 'admin-panel',
        element: <AdminPanel />,
      },
    ],
  },
]);

