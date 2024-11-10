import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Buffer } from 'buffer';
import { WalletProvider } from './context/WalletContext';

// Polyfill Buffer for the browser
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
);