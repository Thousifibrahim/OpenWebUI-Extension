import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

// Toast configuration
const toastOptions = {
  duration: 4000,
  style: {
    background: '#1F1F1F',
    color: '#F3F4F6',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    maxWidth: '500px',
  },
  success: {
    iconTheme: {
      primary: '#F59E0B',
      secondary: '#1F1F1F',
    },
  },
  error: {
    iconTheme: {
      primary: '#EF4444',
      secondary: '#1F1F1F',
    },
  },
  loading: {
    iconTheme: {
      primary: '#F59E0B',
      secondary: '#1F1F1F',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right" 
        toastOptions={toastOptions}
        containerStyle={{
          top: 80,
          right: 20,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);