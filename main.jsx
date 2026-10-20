import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import './styles.css';

// Apply the saved theme before the first paint
document.documentElement.dataset.theme = localStorage.getItem('nestnode_theme') || 'light';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'Manrope, sans-serif', fontWeight: 600 } }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
