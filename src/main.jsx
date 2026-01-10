import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AuthWrapper from './AuthWrapper';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthWrapper>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthWrapper>
    </BrowserRouter>
  </StrictMode>
);
