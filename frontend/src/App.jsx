import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Core Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages View System
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import ProductListings from './pages/ProductListings';
import ProductDetails from './pages/ProductDetails';
import SellerDashboard from './pages/SellerDashboard';
import ChatPage from './pages/ChatPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';

// Inner layout to dynamically assign custom mesh grids based on active theme
function AppContent() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'mesh-bg-dark text-slate-100' : 'mesh-bg-light text-slate-800'
    }`}>
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/listings" element={<ProductListings />} />
          <Route path="/listings/:id" element={<ProductDetails />} />
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
