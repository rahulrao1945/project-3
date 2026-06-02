import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle2, ShieldAlert, Image, IndianRupee, Eye, ShoppingCart, HelpCircle, EyeOff, Clipboard, Check, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { API_BASE, API_BASE_URL } from '../config';

const CATEGORIES = [
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

export default function SellerDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  // Listings state
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields State for New Product
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('Arduino & ESP Boards');
  const [isKit, setIsKit] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchMyListings = () => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE}/products?status=All`)
      .then(res => res.json())
      .then(data => {
        // Filter products matching active user ID
        const myItems = data.filter(item => item.seller === user._id);
        setListings(myItems);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  // Handle auto-opening uploader modal if ?new=true query is parsed
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('new') === 'true') {
      setShowAddModal(true);
      // Clean query path so refreshing doesn't reopen modal
      navigate('/dashboard', { replace: true });
    }
  }, [location.search]);

  // Statistics Computations
  const totalListings = listings.length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  const totalViews = listings.reduce((acc, curr) => (curr.views || 0) + acc, 0);
  const totalEarnings = listings
    .filter(l => l.status === 'sold')
    .reduce((acc, curr) => curr.price + acc, 0);

  // File Selector handler
  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Submit listing to backend
  const handleSubmitListing = async (e) => {
    e.preventDefault();
    if (!title || !description || !price) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('condition', condition);
      formData.append('category', category);
      formData.append('isKit', isKit);

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Listing failed');

      // Refresh list, close modal, clean form
      setListings(prev => [data, ...prev]);
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setCondition('Good');
      setCategory('Arduino & ESP Boards');
      setIsKit(false);
      setSelectedFiles([]);
      alert('Success! Your engineering component is now listed on campus.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle "Mark as Sold" and fire confetti!
  const handleMarkAsSold = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: 'sold' })
      });

      if (!res.ok) throw new Error('Status update failed');

      // Update local state
      setListings(prev => prev.map(item => item._id === id ? { ...item, status: 'sold' } : item));
      
      // Fire congratulations confetti blast!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#059669']
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete product listing
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing from the marketplace?')) return;

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!res.ok) throw new Error('Deletion failed');

      setListings(prev => prev.filter(item => item._id !== id));
      alert('Listing deleted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Safe image path helper
  const resolveImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=500&auto=format&fit=crop';
    if (img.startsWith('/uploads')) {
      return `${API_BASE_URL}${img}`;
    }
    return img;
  };

  if (!user) return null;

  return (
    <div className="flex-grow min-h-screen px-4 lg:px-12 py-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* 🚀 Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Seller Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-semibold">
            Hello, <span className="text-emerald-500">{user.name}</span>. Manage your active campus listings and track earnings.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          <span>Publish Component</span>
        </button>
      </div>

      {/* 📊 Metrics Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Total Listings</span>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{totalListings}</span>
        </div>
        <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Items Sold</span>
          <span className="text-3xl font-extrabold text-indigo-500 mt-1 block">{soldListings}</span>
        </div>
        <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Accumulated Views</span>
          <span className="text-3xl font-extrabold text-cyan-500 mt-1 block flex items-center space-x-1">
            <Eye className="h-5 w-5 text-cyan-500 mr-1" />
            <span>{totalViews}</span>
          </span>
        </div>
        <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Total Earnings</span>
          <span className="text-3xl font-extrabold text-emerald-500 mt-1 block flex items-center">
            <span>₹{totalEarnings}</span>
          </span>
        </div>
      </section>

      {/* 📁 Listed Products Manager */}
      <section className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-extrabold text-xl text-slate-800 dark:text-white mb-6">Manage Listed Hardware</h3>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="font-bold text-slate-600 dark:text-slate-400">No components published yet.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Unused sensors or Arduino modules? Get them sold!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold text-xs"
            >
              List First Hardware
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 px-4">Price</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Views</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/80 text-sm">
                {listings.map((prod) => (
                  <tr key={prod._id} className="group">
                    {/* Item details */}
                    <td className="py-4 pr-4 flex items-center space-x-3">
                      <img
                        src={resolveImage(prod.images[0])}
                        alt={prod.title}
                        className="w-12 h-12 object-cover rounded-lg bg-slate-900 border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block group-hover:text-emerald-500 transition-colors">
                          {prod.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {prod.condition} Condition {prod.isKit && '• 🛠️ Project Kit'}
                        </span>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{prod.price}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {prod.category}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        prod.status === 'sold'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {prod.status === 'sold' ? 'Sold' : 'Available'}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 text-slate-500">
                      {prod.views || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {prod.status !== 'sold' && (
                          <button
                            onClick={() => handleMarkAsSold(prod._id)}
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 transition-all duration-200"
                            title="Mark as Sold"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteListing(prod._id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition-all duration-200"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 📁 Publisher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-scaleIn space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-lg text-slate-800 dark:text-white">List Hardware Component</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">Close</button>
            </div>

            <form onSubmit={handleSubmitListing} className="space-y-4 text-xs font-semibold text-slate-400">
              
              {/* Title */}
              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. ESP32 NodeMCU Dev Board"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white text-sm focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Price & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="block uppercase tracking-wide">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white text-sm focus:outline-none"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block uppercase tracking-wide">Condition</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white text-sm focus:outline-none"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="Good">Good (Used lightly)</option>
                    <option value="Used">Used (Functional)</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">Category</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white text-sm focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">Detailed Specifications & Contact Notes</label>
                <textarea
                  rows="3"
                  placeholder="Pins pre-soldered, operates at 5V, includes breadboard. Meet near Block D main lobby."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white text-sm focus:outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Is complete kit check */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isKitCheckbox"
                  className="h-4 w-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                  checked={isKit}
                  onChange={(e) => setIsKit(e.target.checked)}
                />
                <label htmlFor="isKitCheckbox" className="text-xs text-slate-500 dark:text-slate-300 cursor-pointer select-none">
                  🛠️ This item is a complete **Project Kit** containing multiple bundled parts!
                </label>
              </div>

              {/* Image files selector */}
              <div className="space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500/40 transition-colors">
                <Image className="h-8 w-8 text-slate-400 mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Upload Images</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">JPEG, PNG, WEBP (Max 5 files, 10MB limit)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2 text-xs font-bold text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded focus:outline-none"
                />
                {selectedFiles.length > 0 && (
                  <div className="text-xs text-emerald-500 font-bold mt-2">
                    📎 {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              {/* Submit triggers */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold flex items-center space-x-1 shadow-md shadow-emerald-500/10"
                >
                  <span>{submitting ? 'Uploading...' : 'Publish Listing'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
