import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Heart, Eye, ArrowLeft, Star, ShoppingBag, Send, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRShare from '../components/QRShare';
import ProductCard from '../components/ProductCard';
import { API_BASE, API_BASE_URL } from '../config';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWishlist } = useAuth();

  // Core details state
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Quick Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Wishlist check
  const isWishlisted = user?.wishlist?.includes(product?._id);

  const fetchDetails = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Listing details not found.');
        return res.json();
      })
      .then(data => {
        setProduct(data.product);
        setSeller(data.seller);
        
        // Fetch Seller Reviews
        return fetch(`${API_BASE}/products/reviews/${data.product.seller}`);
      })
      .then(res => res.json())
      .then(reviewsData => {
        setReviews(reviewsData);
        // Fetch AI Recommendations
        return fetch(`${API_BASE}/products/recommendations/${id}`);
      })
      .then(res => res.json())
      .then(recData => {
        setRecommendations(recData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleWishlist = async () => {
    if (!user) {
      alert('Please log in to add to wishlist!');
      return;
    }
    try {
      await toggleWishlist(product._id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a rating review.');
      return;
    }
    if (comment.trim() === '') return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/products/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          sellerId: product.seller,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review failed');

      setReviews(prev => [data, ...prev]);
      setComment('');
      alert('Seller reviewed successfully! Thank you!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Chat Initiator Trigger
  const handleInitiateChat = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to chat with the seller!');
      return;
    }
    if (chatMessage.trim() === '') return;

    setSendingChat(true);
    try {
      // Compute Room ID between buyer and seller (alphabetically sorted)
      const roomId = [user._id, product.seller].sort().join('-');

      // Save initial message to database
      const res = await fetch(`${API_BASE_URL}/api/chat/history/${roomId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      // If room has no messages, post the first message
      // Actually we can send a WebSocket packet or post a basic rest chat
      // We can establish a mock chat trigger using HTTP POST or rely on Socket
      // To keep it simple: we post the chat message by creating a message packet in the database!
      // Wait! We can post to our database using Socket or a Rest endpoint. Let's make sure we route them to the ChatPage and pass the message!
      // We can save the message inside local_db using our socket, or just route to the chat page immediately!
      // Routing to the chat page with the recipient ID as a query parameter is extremely neat: `/chat?user=${product.seller}&message=${encodeURIComponent(chatMessage)}`
      // That way the ChatPage component loads the WebSocket, joins the room, and auto-sends the message inside useEffect! That is extremely elegant and robust!
      navigate(`/chat?user=${product.seller}&message=${encodeURIComponent(chatMessage)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
      setShowChatModal(false);
    }
  };

  // Safe image mapping helper
  const resolveImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=500&auto=format&fit=crop';
    if (img.startsWith('/uploads')) {
      return `${API_BASE_URL}${img}`;
    }
    return img;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse space-y-8">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Listing Unavailable</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{error || 'Product has been deleted or is no longer listed.'}</p>
        <Link to="/listings" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-emerald-500 text-white font-bold">
          Return to Explore
        </Link>
      </div>
    );
  }

  const isOwner = user && user._id === product.seller;
  const isSold = product.status === 'sold';

  return (
    <div className="flex-grow min-h-screen px-4 lg:px-12 py-10 max-w-7xl mx-auto w-full space-y-12">
      
      {/* Back navigate trigger */}
      <div>
        <Link to="/listings" className="inline-flex items-center space-x-1.5 text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore catalog</span>
        </Link>
      </div>

      {/* 📁 Product visual specifications */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Big Image Display */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden glass-card border border-slate-200 dark:border-slate-800 shadow-xl aspect-video bg-slate-900">
            <img
              src={resolveImage(product.images[0])}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {isSold && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                <span className="px-6 py-3 rounded-full border border-rose-500 bg-rose-500/25 text-rose-400 font-extrabold text-lg uppercase tracking-widest shadow-2xl">
                  Product Sold Out
                </span>
              </div>
            )}
            
            {product.isKit && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1">
                <Cpu className="h-4 w-4 animate-pulse" />
                <span>⚙ Complete Project Kit</span>
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">Hardware Description</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
              {product.description}
            </p>
          </div>
        </div>

        {/* Right Column: Pricing & Contact Action Drawer */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6">
            
            {/* Title, Category & Views block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-widest">{product.category}</span>
                <span className="flex items-center space-x-1 font-medium">
                  <Eye className="h-4 w-4" />
                  <span>{product.views || 0} views</span>
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">{product.title}</h2>
              <div className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Condition: {product.condition}
              </div>
            </div>

            {/* Pricing block */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Student Price</span>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{product.price}</span>
              </div>
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isWishlisted 
                    ? 'bg-rose-500 text-white border-transparent shadow-lg shadow-rose-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 dark:hover:text-rose-500 border-slate-200 dark:border-slate-800'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Primary Action Buttons */}
            {!isSold && (
              <div className="space-y-3">
                {isOwner ? (
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md transition-all duration-200"
                  >
                    <span>Manage My Listings</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setShowChatModal(true)}
                      className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300"
                    >
                      <MessageSquare className="h-5 w-5 animate-pulse" />
                      <span>Chat with Seller Inside App</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Seller profile card */}
            {seller && (
              <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={seller.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${seller.name}`}
                    alt={seller.name}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-950"
                  />
                  <div>
                    <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Seller Profile</span>
                    <span className="font-extrabold text-slate-800 dark:text-white block text-sm leading-tight">{seller.name}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">{seller.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-500 bg-amber-500/5 p-2 rounded">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  <span>Seller Rating: {seller.averageRating} ({seller.reviewsCount} review{seller.reviewsCount !== 1 ? 's' : ''})</span>
                </div>
              </div>
            )}

          </div>

          {/* QR sharing code */}
          {seller && seller.contactInfo && (
            <QRShare
              phone={seller.contactInfo.phone}
              whatsapp={seller.contactInfo.whatsapp}
              telegram={seller.contactInfo.telegram}
              sellerName={seller.name}
            />
          )}

        </div>

      </section>

      {/* 💬 Review & Rating Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Submissions Review Form */}
        {seller && (
          <div className="lg:col-span-1 glass-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">Submit Seller Review</h3>
            
            {isOwner ? (
              <p className="text-xs text-slate-400 font-medium">
                ⚠️ Students are not allowed to submit reviews for their own listings.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Rating</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
                    <option value="4">⭐⭐⭐⭐ Good (4)</option>
                    <option value="3">⭐⭐⭐ Fair (3)</option>
                    <option value="2">⭐⭐ Poor (2)</option>
                    <option value="1">⭐ Critical (1)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Review Comment</label>
                  <textarea
                    rows="3"
                    placeholder="Describe transaction location speed and product conditions..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase"
                >
                  <span>Submit Rating</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Right Column: Listing Reviews List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">Seller Feedback ({reviews.length})</h3>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              💬 No ratings logged for this seller yet. Be the first to evaluate!
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{rev.reviewerName}</span>
                    <span className="text-slate-400">{new Date(rev.createdAt || rev.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Print stars */}
                  <div className="flex items-center space-x-0.5 text-amber-500 text-xs">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* 🧠 AI Recommendations section */}
      {recommendations.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/80">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Cpu className="h-5 w-5 text-emerald-500 animate-pulse" />
              <span>Recommended Hardware Components (AI-Suggested)</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Content-based similarity model suggestions based on overlaps in categories, price matching, and hardware conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 💬 Initiating Chat overlay Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-scaleIn">
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-white mb-2">
              Message {seller?.name}
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Write a message to trigger an instant deal. WhatsApp links and app alerts are generated instantly.
            </p>

            <form onSubmit={handleInitiateChat} className="space-y-4">
              <textarea
                rows="4"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:outline-none text-slate-800 dark:text-white focus:border-emerald-500/40"
                placeholder="Hey! I want to buy this component. Can we meet in Block C cafeteria at 3:00 PM today?"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                required
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingChat}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center space-x-1.5"
                >
                  <span>Send Deal</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
