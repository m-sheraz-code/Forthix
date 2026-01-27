import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import SplashScreen from './components/SplashScreen';
import './index.css';

const SPLASH_SHOWN_KEY = 'forthix-splash-shown';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash if not already shown this session
    return !sessionStorage.getItem(SPLASH_SHOWN_KEY);
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    setShowSplash(false);
    
    // Remove the inline splash screen from index.html
    const inlineSplash = document.getElementById('initial-splash');
    if (inlineSplash) {
      inlineSplash.style.opacity = '0';
      setTimeout(() => inlineSplash.remove(), 300);
    }
  };

  // Remove inline splash immediately if we're not showing React splash
  useEffect(() => {
    if (!showSplash) {
      const inlineSplash = document.getElementById('initial-splash');
      if (inlineSplash) {
        inlineSplash.style.opacity = '0';
        setTimeout(() => inlineSplash.remove(), 300);
      }
    }
  }, [showSplash]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <RouterProvider router={router} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
