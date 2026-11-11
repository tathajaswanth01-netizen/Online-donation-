import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Mail, Key, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: enter email, 2: enter reset token and new password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        toast.success(res.data.message);
        // For convenience in local demo, auto-fill token if returned
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not find account with that email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        resetToken: resetToken.trim(),
        newPassword
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-100 min-h-screen py-12 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-700 flex items-center justify-center text-white">
              <Gift size={24} className="text-cream-200" />
            </div>
            <span className="text-2xl font-bold text-forest-900">
              Give<span className="text-amberGold-400">Care</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-charcoal-900 pt-1">
            Account Recovery
          </h2>
          <p className="text-xs text-charcoal-500">
            {step === 1
              ? 'Enter your registered email address to receive password reset instructions.'
              : 'Enter your verification reset token and choose a new password.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {loading ? 'Verifying...' : 'Request Reset Token'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-semibold text-forest-700 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Reset Token
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  required
                  placeholder="Paste reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {loading ? 'Resetting Password...' : 'Reset & Save Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
