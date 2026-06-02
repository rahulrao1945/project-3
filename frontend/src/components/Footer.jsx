import React from 'react';
import { Cpu, Mail, Phone, MapPin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/80 py-12 px-6 lg:px-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* About column */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-800 dark:text-white">
              Edu<span className="text-emerald-500">Trade</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            The premium peer-to-peer electronics exchange portal for college students. Swap components, purchase robotics kits, and find drone elements directly inside campus.
          </p>
        </div>

        {/* Categories shortcut */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
            Quick Categories
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/listings?category=Arduino%20%26%20ESP%20Boards" className="hover:text-emerald-500 transition-colors">
                Arduino & ESP Boards
              </Link>
            </li>
            <li>
              <Link to="/listings?category=Robotics%20Parts" className="hover:text-emerald-500 transition-colors">
                Robotics Parts
              </Link>
            </li>
            <li>
              <Link to="/listings?category=Drone%20Components" className="hover:text-emerald-500 transition-colors">
                Drone Components
              </Link>
            </li>
            <li>
              <Link to="/listings?category=Sensors" className="hover:text-emerald-500 transition-colors">
                Sensors & Motors
              </Link>
            </li>
          </ul>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
            Marketplace Info
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/listings" className="hover:text-emerald-500 transition-colors">
                All Listings
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-emerald-500 transition-colors">
                Student Profile
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-emerald-500 transition-colors">
                Seller Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Campus contact details */}
        <div className="flex flex-col space-y-3 text-sm">
          <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm uppercase tracking-wider">
            Campus Office
          </h4>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            <span>Block C, Innovation Lab, Lab-4</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-emerald-500" />
            <span>support@edutrade.college.edu</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-emerald-500" />
            <span>+1 (555) 234-5678</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs">
        <p>© 2026 EduTrade. Engineered with ❤️ for college innovators and electronics builders.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-emerald-500 transition-colors">
            Campus Guidelines
          </a>
          <span>•</span>
          <a href="#" className="hover:text-emerald-500 transition-colors">
            Safety & Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
