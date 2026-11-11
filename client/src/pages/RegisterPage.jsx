import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Lock, Mail, User, Phone, MapPin, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Account Type
  const [accountType, setAccountType] = useState('both');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (!termsAccepted) {
      toast.error('You must accept the platform terms and anti-misuse guidelines.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phone', phone.trim());
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('accountType', accountType);
      formData.append('termsAccepted', termsAccepted);

      const addressObj = {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      };
      formData.append('address', JSON.stringify(addressObj));

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await register(formData);
      if (res.success) {
        navigate('/');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-100 min-h-screen py-12 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Brand Header */}
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
            Create Your Account
          </h2>
          <p className="text-xs text-charcoal-500">
            Join a trusted community dedicated to transparent donation and genuine resource reuse.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-5">
          
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
              Primary Location & Address
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:ring-2 focus:ring-forest-600"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="State *"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:ring-2 focus:ring-forest-600"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="PIN Code *"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Street or neighborhood address (Optional)"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
            />
          </div>

          {/* Account Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
              How will you use the platform?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Both (Recommended)', value: 'both' },
                { label: 'Donor Only', value: 'donor' },
                { label: 'Receiver Only', value: 'receiver' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccountType(opt.value)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    accountType === opt.value
                      ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                      : 'bg-cream-50 text-charcoal-700 border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Profile Picture */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
              Profile Picture (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImageFile(e.target.files[0])}
              className="w-full text-xs text-charcoal-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-forest-100 file:text-forest-700"
            />
          </div>

          {/* Terms & Anti-Misuse Checkbox */}
          <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-forest-700 focus:ring-forest-600 w-4 h-4"
              />
              <span className="text-xs text-charcoal-700 leading-snug">
                I accept the platform Terms & Conditions and agree never to resell or commercialize items received through free donation listings.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-md shadow-forest-900/10 transition-all flex items-center justify-center gap-1.5 ${
              submitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight size={15} />
          </button>

          <div className="text-center pt-1 text-xs text-charcoal-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-forest-700 hover:underline">
              Sign In
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
};

export default RegisterPage;
