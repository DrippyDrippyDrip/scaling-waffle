import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Home from './pages/Home';
import Staking from './pages/Staking';

function App() {
  return (
    <WalletProvider>
      <div className="grid-overlay" />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staking" element={<Staking />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;