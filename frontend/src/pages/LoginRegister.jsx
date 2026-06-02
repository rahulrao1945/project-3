import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MessageSquare, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginRegister() {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');

  // Email College Suffix Parser
  const isCollegeEmail = (em) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.[a-z]{2,3}|org)$/;
    return regex.test(em.toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please provide your login credentials.');
      return;
    }

    if (!isLogin && !name) {
      setError('Please provide your full name.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/listings'), 1200);
      } else {
        if (!isCollegeEmail(email)) {
          setError('Invalid domain. Registration is restricted to verified student emails ending with .edu, .ac.*, or .org college domains.');
          return;
        }
        
        // Build whatsapp Link
        const formattedWhatsapp = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '';
        const formattedTelegram = telegram ? `https://telegram.me/${telegram.replace('@', '')}` : '';

        await register(name, email, password, phone, formattedWhatsapp, formattedTelegram);
        setSuccess('Student registration completed! Redirecting...');
        setTimeout(() => navigate('/listings'), 1200);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="flex-grow min-h-screen flex items-center justify-center py-16 px-6 relative overflow-hidden">
      
      {/* Background radial effects */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />

      <div className="w-full max-w-lg glass-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 relative overflow-hidden">
        
        {/* Glowing Chip Indicator */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 mb-2 animate-bounce-slow">
            <Cpu className="h-6 w-6" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-800 dark:text-white">
            {isLogin ? 'Welcome Back Student' : 'Join Campus Marketplace'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {isLogin ? 'Enter your college credentials to buy and sell' : 'Signup with college email and build campus projects'}
          </p>
        </div>

        {/* Tab Swapper */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800/80 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-grow py-2 rounded-md font-bold text-sm transition-all duration-300 ${
              isLogin ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-grow py-2 rounded-md font-bold text-sm transition-all duration-300 ${
              !isLogin ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Action Error Alerts */}
        {error && (
          <div className="p-3 mb-5 text-sm rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-medium">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-5 text-sm rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
            ✅ {success}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Only on Register) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  className="w-full bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">College Email</label>
              {email && (
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isCollegeEmail(email) ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isCollegeEmail(email) ? '✓ Verified Student Domain' : '⚠ Must end in .edu/.ac.*/.org'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="student@college.edu"
                className="w-full bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contact Details Fields (Only on Register) */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1 col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">WhatsApp No.</label>
                <div className="relative flex items-center">
                  <MessageSquare className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. 9198765..."
                    className="w-full bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Telegram Username</label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. alex_rivera"
                    className="w-full bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center space-x-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300"
          >
            <span>{isLogin ? 'Sign In to Campus' : 'Register Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>

        {/* Demo Credentials Hint */}
        {isLogin && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/60 text-xs text-slate-400 text-center space-y-1.5 font-medium">
            <p>💡 <b>Quick Local Developer Testing:</b></p>
            <p>Admin Account: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-500">admin@college.edu</code></p>
            <p>Student Account: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-500">alex@college.edu</code></p>
            <p>Demo Password: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-500">student123</code></p>
          </div>
        )}

      </div>
    </div>
  );
}
