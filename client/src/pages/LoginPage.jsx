import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gift, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate(from, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="bg-cream-100 min-h-screen py-12 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-md shadow-forest-900/10">
              <Gift size={24} className="text-cream-200" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-forest-900">
              Give<span className="text-amberGold-400">Care</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-charcoal-900 pt-1">
            Welcome Back
          </h2>
          <p className="text-xs text-charcoal-500">
            Log in to manage your donations, track requests, and communicate with community members.
          </p>
        </div>

        {/* Demo Login Shortcuts for easy testing */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-cream-300 shadow-xs space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600">
            Quick Demo Accounts (1-Click Fill):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@platform.org', 'Admin@123')}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-semibold border border-amber-200 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sarah.donor@example.com', 'Donor@123')}
              className="py-1.5 px-2 bg-forest-50 hover:bg-forest-100 text-forest-800 rounded-lg text-[11px] font-semibold border border-forest-200 transition-colors"
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('arjun.receiver@example.com', 'Receiver@123')}
              className="py-1.5 px-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[11px] font-semibold border border-teal-200 transition-colors"
            >
              Receiver
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-forest-700 focus:ring-forest-600 w-4 h-4"
              />
              <span className="text-charcoal-600">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-forest-700 hover:text-forest-800 font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-md shadow-forest-900/10 transition-all flex items-center justify-center gap-1.5 ${
              submitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <span>{submitting ? 'Logging in...' : 'Sign In to Account'}</span>
            <ArrowRight size={15} />
          </button>

          <div className="text-center pt-2 text-xs text-charcoal-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-forest-700 hover:underline">
              Create an account
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
};

export default LoginPage;
