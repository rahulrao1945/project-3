import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, RefreshCw, Layers, CheckSquare, Square, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const API_BASE = 'http://localhost:5000/api';

const CATEGORIES = [
  'All',
  'Arduino & ESP Boards',
  'Drone Components',
  'Robotics Parts',
  'Sensors',
  'Batteries',
  'Motors & Drivers',
  'Tools',
  'Wires & Connectors',
  'Laptop Accessories',
  'Miscellaneous'
];

export default function ProductListings() {
  const location = useLocation();

  // Parse initial query params from Router location
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || 'All';

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isKit, setIsKit] = useState(null); // null = all, true = only kits, false = only parts
  const [showSold, setShowSold] = useState(false);

  // Products and Loading State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFilteredProducts = () => {
    setLoading(true);
    setError(null);
    
    // Construct query parameters
    const params = new URLSearchParams();
    if (search.trim() !== '') params.append('search', search.trim());
    if (category !== 'All') params.append('category', category);
    if (condition !== 'All') params.append('condition', condition);
    if (minPrice !== '') params.append('minPrice', minPrice);
    if (maxPrice !== '') params.append('maxPrice', maxPrice);
    if (showSold) {
      params.append('status', 'All'); // Fetch both available and sold
    } else {
      params.append('status', 'available'); // Available only
    }
    if (isKit !== null) params.append('isKit', isKit.toString());

    fetch(`${API_BASE}/products?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve components.');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  // Re-trigger fetch when filters change
  useEffect(() => {
    fetchFilteredProducts();
  }, [category, condition, showSold, isKit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setCondition('All');
    setMinPrice('');
    setMaxPrice('');
    setIsKit(null);
    setShowSold(false);
  };

  // Run initial search check if params altered externally
  useEffect(() => {
    const freshParams = new URLSearchParams(location.search);
    setSearch(freshParams.get('search') || '');
    setCategory(freshParams.get('category') || 'All');
  }, [location.search]);

  return (
    <div className="flex-grow min-h-screen px-4 lg:px-12 py-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* 🛠️ Sidebar Advanced Filters */}
      <aside className="lg:col-span-1 glass-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 h-fit space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-white font-bold">
            <SlidersHorizontal className="h-5 w-5 text-emerald-500" />
            <span>Search Filters</span>
          </div>
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-emerald-500 font-bold flex items-center space-x-1"
            title="Clear all filters"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Categories select list */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Category</label>
          <select
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500/40"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Condition options */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Hardware Condition</label>
          <div className="flex flex-wrap gap-2">
            {['All', 'New', 'Good', 'Used'].map((cond, idx) => (
              <button
                key={idx}
                onClick={() => setCondition(cond)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                  condition === cond
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Price limits range */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Price Range (₹)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button
            onClick={fetchFilteredProducts}
            className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase transition-all duration-200 mt-2"
          >
            Apply Price Filter
          </button>
        </div>

        {/* Filter by project kits */}
        <div className="space-y-2 border-t border-slate-200/50 dark:border-slate-800/80 pt-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Hardware Format</label>
          <div className="flex flex-col space-y-2 text-sm">
            <button
              onClick={() => setIsKit(null)}
              className={`flex items-center space-x-2 text-left py-1 ${isKit === null ? 'text-emerald-500 font-bold' : 'text-slate-500'}`}
            >
              <Layers className="h-4 w-4" />
              <span>Show All Electronics</span>
            </button>
            <button
              onClick={() => setIsKit(true)}
              className={`flex items-center space-x-2 text-left py-1 ${isKit === true ? 'text-emerald-500 font-bold' : 'text-slate-500'}`}
            >
              {isKit === true ? <CheckSquare className="h-4 w-4 text-emerald-500" /> : <Square className="h-4 w-4" />}
              <span>🛠️ Only Complete Project Kits</span>
            </button>
            <button
              onClick={() => setIsKit(false)}
              className={`flex items-center space-x-2 text-left py-1 ${isKit === false ? 'text-emerald-500 font-bold' : 'text-slate-500'}`}
            >
              {isKit === false ? <CheckSquare className="h-4 w-4 text-emerald-500" /> : <Square className="h-4 w-4" />}
              <span>🔌 Only Loose Components</span>
            </button>
          </div>
        </div>

        {/* Sold overlay checkbox filter */}
        <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/80 pt-4">
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Show Sold Items</span>
            <span className="text-[10px] text-slate-400">Include historic out-of-stock listings</span>
          </div>
          <button onClick={() => setShowSold(!showSold)} className="text-emerald-500 focus:outline-none">
            {showSold ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
          </button>
        </div>

      </aside>

      {/* 📁 Catalog Listings grid */}
      <main className="lg:col-span-3 space-y-6">
        
        {/* Search header bar */}
        <form onSubmit={handleSearchSubmit} className="flex p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center flex-grow px-3">
            <Search className="h-4.5 w-4.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search components by name or tag..."
              className="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none py-1.5 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow"
          >
            Apply
          </button>
        </form>

        {/* Count summary bar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">
            Showing <span className="text-emerald-500">{products.length}</span> components found
          </span>
          {category !== 'All' && (
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold uppercase">
              Filter: {category}
            </span>
          )}
        </div>

        {/* Listing Grid handler */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 h-80" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 glass-card rounded-xl border border-rose-500/20">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
            <p className="font-bold text-rose-500">Retrieval Error</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-xl border border-slate-200 dark:border-slate-800/80">
            <SlidersHorizontal className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No components match your parameters.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or modifying your query!</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
