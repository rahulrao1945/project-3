import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MessageSquare, ShieldCheck, Heart, Star, Edit, Save, HelpCircle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const API_BASE = 'http://localhost:5000/api';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  // Form edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [avatar, setAvatar] = useState('');

  // Wishlist & Ratings states
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Set initial fields from user context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.contactInfo?.phone || '');
      setWhatsapp(user.contactInfo?.whatsapp || '');
      setTelegram(user.contactInfo?.telegram || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Fetch Wishlisted Products & Reviews
  const fetchProfileLists = async () => {
    if (!user) return;
    setLoadingLists(true);
    try {
      // 1. Fetch products & filter wishlisted items
      const prodRes = await fetch(`${API_BASE}/products?status=All`);
      const prodData = await prodRes.json();
      
      const wishlisted = prodData.filter((p) => user.wishlist?.includes(p._id));
      setWishlistProducts(wishlisted);

      // 2. Fetch reviews received as a seller
      const revRes = await fetch(`${API_BASE}/products/reviews/${user._id}`);
      const revData = await revRes.json();
      setReviews(revData);

      setLoadingLists(false);
    } catch (err) {
      console.error(err);
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchProfileLists();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Ensure whatsapp starts with standard API format
      let formattedWhatsapp = whatsapp;
      if (whatsapp && !whatsapp.startsWith('http')) {
        formattedWhatsapp = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
      }
      
      let formattedTelegram = telegram;
      if (telegram && !telegram.startsWith('http')) {
        formattedTelegram = `https://telegram.me/${telegram.replace('@', '')}`;
      }

      await updateProfile({
        name,
        password: password || undefined,
        phone,
        whatsapp: formattedWhatsapp,
        telegram: formattedTelegram,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      });

      setIsEditing(false);
      setPassword('');
      alert('Profile details updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update details.');
    }
  };

  if (!user) return null;

  return (
    <div className="flex-grow min-h-screen px-4 lg:px-12 py-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Panel: Profile summary & Editor */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

          {/* Student Profile summary card */}
          <div className="flex flex-col items-center text-center">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
              alt={user.name}
              className="w-24 h-24 rounded-full border-2 border-emerald-500/20 bg-slate-950 mb-3 shadow-lg"
            />
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white leading-tight">{user.name}</h3>
            <span className="text-xs text-slate-400 mt-1 block font-medium">{user.email}</span>
            <span className="mt-2.5 px-3 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-widest">
              Verified Student ({user.role})
            </span>
          </div>

          {/* Contact Details summary list */}
          {!isEditing ? (
            <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2.5 p-2 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80">
                <Phone className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Phone</span>
                  <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{user.contactInfo?.phone || 'No phone registered'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-2 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">WhatsApp Link</span>
                  <span className="text-slate-700 dark:text-slate-300 block mt-0.5 truncate max-w-[220px]">
                    {user.contactInfo?.whatsapp ? (
                      <a href={user.contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
                        Open Chat URL
                      </a>
                    ) : 'No WhatsApp linked'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-2 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Telegram Portal</span>
                  <span className="text-slate-700 dark:text-slate-300 block mt-0.5">
                    {user.contactInfo?.telegram ? (
                      <a href={user.contactInfo.telegram} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
                        Send DM
                      </a>
                    ) : 'No Telegram username linked'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 font-extrabold uppercase hover:-translate-y-0.5 transition-all duration-300 text-xs"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          ) : (
            /* Editing Fields form */
            <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-semibold text-slate-400">
              
              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">Phone Number</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">WhatsApp No. (e.g. 919876543210)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white focus:outline-none"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">Telegram Username (e.g. alex_rivera)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white focus:outline-none"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block uppercase tracking-wide">Avatar Seed Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-white focus:outline-none"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold flex items-center justify-center space-x-1"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </aside>

      {/* Right Column: Wishlist Catalog & Received Reviews */}
      <main className="lg:col-span-2 space-y-8">
        
        {/* 1. Wishlist Grid list */}
        <section className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center space-x-1.5">
            <Heart className="h-5 w-5 text-rose-500 fill-current" />
            <span>My Component Wishlist ({wishlistProducts.length})</span>
          </h3>

          {loadingLists ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              <Package className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <span>Wishlist empty. Browse components catalog and select the heart icon to save!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* 2. Received Seller reviews */}
        <section className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center space-x-1.5">
            <Star className="h-5 w-5 text-amber-500 fill-current" />
            <span>Student Comments & Seller Feedback ({reviews.length})</span>
          </h3>

          {loadingLists ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              💬 No ratings logged yet. Sell electronics inside campus and accumulate reviews!
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="text-slate-700 dark:text-slate-200">{rev.reviewerName}</span>
                    <span>{new Date(rev.createdAt || rev.timestamp).toLocaleDateString()}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center space-x-0.5 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

    </div>
  );
}
