import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

// Helper to get category badge colors
const getCategoryColor = (cat) => {
  switch (cat) {
    case 'Arduino & ESP Boards': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    case 'Drone Components': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    case 'Robotics Parts': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'Sensors': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'Batteries': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'Motors & Drivers': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'Tools': return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
    case 'Wires & Connectors': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Laptop Accessories': return 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

export default function ProductCard({ product }) {
  const { user, toggleWishlist } = useAuth();
  
  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add items to your wishlist!');
      return;
    }
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Safe image resolution: If it starts with /uploads, map to the local Express backend
  const resolveImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=500&auto=format&fit=crop';
    if (img.startsWith('/uploads')) {
      return `${API_BASE_URL}${img}`;
    }
    return img;
  };

  const isSold = product.status === 'sold';

  return (
    <div className="relative group rounded-xl overflow-hidden glass-card glass-card-hover glow-border flex flex-col h-full border border-slate-200 dark:border-slate-800 transition-all duration-300">
      
      {/* Product Image Container */}
      <Link to={`/listings/${product._id}`} className="block relative aspect-video overflow-hidden bg-slate-900">
        <img
          src={resolveImage(product.images[0])}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/20 text-rose-400 font-extrabold text-sm uppercase tracking-widest shadow-lg animate-pulse">
              Sold Out
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            isWishlisted 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
              : 'bg-black/40 hover:bg-black/60 text-white hover:scale-110'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Project Kit Badge */}
        {product.isKit && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-indigo-600/90 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1 shadow-md">
            <Package className="h-3 w-3" />
            <span>Project Kit</span>
          </div>
        )}
      </Link>

      {/* Card Content Details */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Category & Condition tags */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className={`px-2.5 py-1 rounded-full border font-semibold ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded ${
            product.condition === 'New' 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : product.condition === 'Good' 
              ? 'bg-blue-500/10 text-blue-500' 
              : 'bg-amber-500/10 text-amber-500'
          }`}>
            {product.condition}
          </span>
        </div>

        {/* Title & Description preview */}
        <Link to={`/listings/${product._id}`} className="block flex-grow mb-2">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </Link>

        {/* Pricing, Views & Actions Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Price</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{product.price}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1 font-medium">
              <Eye className="h-4 w-4 text-slate-400/80" />
              <span>{product.views || 0}</span>
            </span>
            <Link
              to={`/listings/${product._id}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-white dark:text-emerald-400 font-bold transition-all duration-300 shadow-md text-xs"
            >
              Details
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
export { getCategoryColor };
