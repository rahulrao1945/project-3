import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Cpu, MessageSquare, LayoutDashboard, Shield, LogOut, User, Heart, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Branding & Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <Cpu className="h-6 w-6 animate-pulse-slow" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 font-sans">
            Edu<span className="text-emerald-500">Trade</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/listings"
            className={`font-medium transition-colors hover:text-emerald-500 ${
              isActive('/listings') ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Explore Components
          </Link>

          {user ? (
            <>
              {/* Messages Inbox Shortcut */}
              <Link
                to="/chat"
                className={`flex items-center space-x-1 font-medium transition-colors hover:text-emerald-500 ${
                  isActive('/chat') ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Messages Inbox"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Inbox</span>
              </Link>

              {/* Seller Dashboard Shortcut */}
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1 font-medium transition-colors hover:text-emerald-500 ${
                  isActive('/dashboard') ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Seller Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              {/* Admin Panel (If user.role is admin) */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 font-semibold text-rose-500 hover:text-rose-600 transition-colors ${
                    isActive('/admin') ? 'text-rose-600' : ''
                  }`}
                  title="Admin Panel Moderation"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Wishlist Shortcut link in Profile */}
              <Link
                to="/profile"
                className={`flex items-center space-x-1 font-medium transition-colors hover:text-emerald-500 ${
                  isActive('/profile') ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Wishlist & Profile"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              {/* Add Listing Glowing CTA */}
              <Link
                to="/dashboard?new=true"
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Sell Hardware</span>
              </Link>

              {/* Log out icon */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-white dark:text-emerald-400 font-semibold border border-transparent dark:border-emerald-500/30 transition-all duration-300 shadow-md"
            >
              Sign In
            </Link>
          )}

          <ThemeToggle />
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center space-x-4 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive Mobile Layout) */}
      {isOpen && (
        <div className="md:hidden mt-3 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col space-y-4 animate-fadeIn">
          <Link
            to="/listings"
            onClick={() => setIsOpen(false)}
            className={`font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 ${
              isActive('/listings') ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Explore Components
          </Link>

          {user ? (
            <>
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 ${
                  isActive('/chat') ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Inbox Messages</span>
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 ${
                  isActive('/dashboard') ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Seller Dashboard</span>
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 font-semibold py-2 px-3 rounded-lg text-rose-500 hover:bg-rose-500/5`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Moderation</span>
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 ${
                  isActive('/profile') ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/dashboard?new=true"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-2 py-3 rounded-lg bg-emerald-500 text-white font-bold text-center"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Sell Hardware Component</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 py-2 px-3 rounded-lg text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 font-bold"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center py-3 rounded-lg bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 font-semibold text-center"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
