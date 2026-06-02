import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Cpu, ArrowRight, Zap, Shield, HelpCircle, Package, Battery, Hammer, Gauge, Compass } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const API_BASE = 'http://localhost:5000/api';

const CATEGORIES = [
  { name: 'Arduino & ESP Boards', icon: Cpu, count: '12 Available' },
  { name: 'Drone Components', icon: Compass, count: '8 Available' },
  { name: 'Robotics Parts', icon: Hammer, count: '15 Available' },
  { name: 'Sensors', icon: Zap, count: '24 Available' },
  { name: 'Batteries', icon: Battery, count: '9 Available' },
  { name: 'Motors & Drivers', icon: Gauge, count: '11 Available' }
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent featured listings
  useEffect(() => {
    fetch(`${API_BASE}/products?status=available`)
      .then(res => res.json())
      .then(data => {
        // Grab top 4 products
        setFeatured(data.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching featured products:', err);
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim() !== '') {
      navigate(`/listings?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/listings');
    }
  };

  return (
    <div className="flex-grow min-h-screen">
      
      {/* 🚀 Hero Grid Section */}
      <section className="relative px-6 py-20 lg:py-32 lg:px-16 flex flex-col items-center text-center overflow-hidden">
        
        {/* Floating tech background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
        
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-widest animate-bounce-slow">
            <Zap className="h-3.5 w-3.5" />
            <span>Campus Electronic Trading Hub</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
            Trade & Recycle Used <br />
            <span className="gradient-text font-sans">Engineering Hardware</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Seniors list unused sensors, motor controllers, drone parts, and project hardware. Juniors buy them instantly at student prices. No shipping, no wait — swap right on campus!
          </p>

          {/* Interactive Hero Search Form */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto"
          >
            <div className="flex items-center flex-grow px-3">
              <Search className="h-5 w-5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search Arduino, ESP32, Lipo Batteries, Servos..."
                className="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all duration-300 shadow-md shadow-emerald-500/20"
            >
              Search
            </button>
          </form>

        </div>

      </section>

      {/* 📊 Campus Statistics Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl text-center border border-slate-200/50 dark:border-slate-800">
            <span className="text-4xl font-extrabold text-emerald-500 block mb-1">250+</span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">Components Exchanged</span>
            <span className="text-sm text-slate-500 mt-2 block">Motors, microcontrollers, and micro-tools swapped.</span>
          </div>
          <div className="glass-card p-6 rounded-xl text-center border border-slate-200/50 dark:border-slate-800">
            <span className="text-4xl font-extrabold text-emerald-500 block mb-1">₹45,000+</span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">Junior Student Savings</span>
            <span className="text-sm text-slate-500 mt-2 block">Obtained quality components at 50-70% retail prices.</span>
          </div>
          <div className="glass-card p-6 rounded-xl text-center border border-slate-200/50 dark:border-slate-800">
            <span className="text-4xl font-extrabold text-emerald-500 block mb-1">100% Verified</span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">Campus Hand-overs</span>
            <span className="text-sm text-slate-500 mt-2 block">Safe exchanges inside library, cafeteria, or hostels.</span>
          </div>
        </div>
      </section>

      {/* 📂 Core Categories Section */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-16 px-6 lg:px-16 border-y border-slate-200/50 dark:border-slate-800/80 mb-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center md:text-left md:flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Shop By Category
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Find exactly the microcontroller or motor you need for your lab experiment.
              </p>
            </div>
            <Link
              to="/listings"
              className="inline-flex items-center space-x-1.5 text-emerald-500 font-bold hover:underline mt-4 md:mt-0"
            >
              <span>View All 10 Categories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/listings?category=${encodeURIComponent(cat.name)}`}
                  className="glass-card p-6 rounded-xl text-center border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center group"
                >
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 mb-3.5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 block mb-1">
                    {cat.name}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{cat.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📦 Recent Hardware Featured Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Components
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Check out the latest electronic elements published by senior engineering students today.
            </p>
          </div>
          <Link
            to="/listings"
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-md transition-all duration-200"
          >
            Explore All
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 h-80" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-bold">No active listings found.</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to list a component for sale!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 🛠️ Project Kits Feature Banner */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="relative rounded-2xl overflow-hidden glass-card p-8 md:p-12 border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between shadow-2xl">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-2xl space-y-4 mb-6 md:mb-0">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-indigo-500/15 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Package className="h-3.5 w-3.5" />
              <span>Project Kits Exchange</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Finished with your Semester Lab Kit?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Don't throw away complete packages. Arduino Starter Kits, quadcopter frames, or self-assembled Line Follower Robots (LFR) can be sold as single bundles. List them as a **"Project Kit"** and pass the complete package to a junior!
            </p>
          </div>

          <Link
            to="/dashboard?new=true"
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-md shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Sell Your Project Kit
          </Link>

        </div>
      </section>

    </div>
  );
}
