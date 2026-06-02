import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Trash2, UserMinus, ShieldCheck, Flag, Users, HelpCircle, PackageOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      alert('Access Denied: Administrative credentials required.');
      navigate('/listings');
    }
  }, [user]);

  // Lists state
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      // 1. Fetch all products (including sold ones)
      const prodRes = await fetch(`${API_BASE}/products?status=All`);
      const prodData = await prodRes.json();
      setProducts(prodData);

      // 2. Fetch all users
      const userRes = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const userData = await userRes.json();
      setUsers(userData);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  // Force delete fake listing
  const handleRemoveListing = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to administratively force delete this listing? This action is permanent.')) return;

    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (!res.ok) throw new Error('Administrative removal failed');

      setProducts(prev => prev.filter(p => p._id !== id));
      alert('Listing removed successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Force ban and wipe user account
  const handleBanUser = async (id, targetName) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to BAN ${targetName}? This will wipe their account and delete all of their products from the marketplace!`)) return;

    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ban failed');

      setUsers(prev => prev.filter(u => u._id !== id));
      // Refresh products as user products are wiped on backend
      setProducts(prev => prev.filter(p => p.seller !== id));
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex-grow min-h-screen px-4 lg:px-12 py-10 max-w-7xl mx-auto w-full space-y-10">
      
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-800 pb-6 flex items-center space-x-2 text-rose-500">
        <ShieldAlert className="h-8 w-8 animate-pulse" />
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Admin Moderation Console</h2>
          <p className="text-slate-400 mt-1 text-xs font-semibold">
            Administrative overview. Prune fraudulent postings, manage registrations, and verify transaction health.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Table Panel: Listings Pruner */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Flag className="h-5 w-5 text-rose-500" />
              <span>Catalog Postings ({products.length})</span>
            </h3>

            {products.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <PackageOpen className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                <span>No active products listed.</span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-2">Listing Item</th>
                      <th className="pb-3 px-2">Price</th>
                      <th className="pb-3 px-2">Seller</th>
                      <th className="pb-3 pl-2 text-right">Moderator Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="py-3 pr-2 font-bold max-w-[200px] truncate" title={p.title}>
                          {p.title}
                          {p.status === 'sold' && <span className="text-[10px] text-rose-500 block">Sold Out</span>}
                        </td>
                        <td className="py-3 px-2 font-extrabold text-emerald-500">₹{p.price}</td>
                        <td className="py-3 px-2 text-slate-400 truncate max-w-[120px]">{p.sellerName || p.seller}</td>
                        <td className="py-3 pl-2 text-right">
                          <button
                            onClick={() => handleRemoveListing(p._id)}
                            className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                            title="Flag and Delete Fake Listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Table Panel: User Registry */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>Student Accounts ({users.length})</span>
            </h3>

            {users.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <HelpCircle className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                <span>No students registered.</span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-2">Student</th>
                      <th className="pb-3 px-2">Role</th>
                      <th className="pb-3 pl-2 text-right">Block</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                        <td className="py-3 pr-2">
                          <span className="font-bold block truncate max-w-[150px]">{u.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{u.email}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.role === 'admin' 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          {u.role !== 'admin' ? (
                            <button
                              onClick={() => handleBanUser(u._id, u.name)}
                              className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                              title="Ban Student Account"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <ShieldCheck className="h-5 w-5 text-rose-500 inline-block" title="Admin protected" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
