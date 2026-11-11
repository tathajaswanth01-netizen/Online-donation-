import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle, CheckCircle, ShieldCheck, HeartHandshake } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RequestModal = ({ donation, isOpen, onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [message, setMessage] = useState('');
  const [preferredPickupMethod, setPreferredPickupMethod] = useState('Self Pickup');
  const [contactPreference, setContactPreference] = useState('Platform Chat');
  const [antiResaleAgreed, setAntiResaleAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !donation) return null;

  // Donor cannot request their own item
  const isDonorSelf = isAuthenticated && (donation.donorId?._id === user?._id || donation.donorId === user?._id);

  const maxQty = donation.availableQuantity || 1;
  const isPaid = donation.donationType === 'Paid';
  const totalPrice = isPaid ? (donation.price * requestedQuantity) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in or register to submit a donation request.');
      navigate('/login');
      return;
    }

    if (isDonorSelf) {
      toast.error('You cannot request your own donation listing.');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please state why you genuinely need this item.');
      return;
    }

    if (!intendedUse.trim()) {
      toast.error('Please describe how this item will be used.');
      return;
    }

    if (!antiResaleAgreed) {
      toast.error('You must agree to the platform non-resale pledge.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/requests', {
        donationId: donation._id,
        requestedQuantity,
        reason,
        intendedUse,
        message,
        preferredPickupMethod,
        contactPreference
      });

      if (res.data.success) {
        toast.success('Donation request submitted! The donor will review your request.');
        if (onSuccess) onSuccess(res.data.donationRequest);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <HeartHandshake className="text-forest-700" size={22} />
            <h2 className="text-lg font-bold text-charcoal-900">
              Request Donation Item
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="p-4 bg-cream-50 border-b border-cream-200 flex gap-3">
          <img
            src={donation.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=300&q=80'}
            alt={donation.title}
            className="w-16 h-16 rounded-xl object-cover border border-cream-300 flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-charcoal-900 truncate">
              {donation.title}
            </h4>
            <p className="text-xs text-charcoal-500">
              Condition: <span className="font-semibold text-charcoal-800">{donation.condition}</span> • Max Available: <span className="font-semibold text-charcoal-800">{donation.availableQuantity}</span>
            </p>
            <div className="mt-1 flex items-center gap-2">
              {isPaid ? (
                <span className="text-xs font-bold text-amberGold-600 bg-amberGold-50 px-2 py-0.5 rounded border border-amberGold-200">
                  Subsidized Price: ₹{donation.price?.toLocaleString()} each
                </span>
              ) : (
                <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                  FREE Resource Transfer
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Warning if owner */}
        {isDonorSelf && (
          <div className="p-4 m-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>This is your own listing. Donors cannot request items they posted.</span>
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Requested Quantity (Max: {maxQty})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={maxQty}
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-28 px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
              />
              <span className="text-xs text-charcoal-500">
                unit{requestedQuantity > 1 ? 's' : ''} requested
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Why do you need this item? <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="2"
              placeholder="Explain your situation or why this donation will help you..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50 placeholder:text-charcoal-400"
            />
          </div>

          {/* Intended Use */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Intended Use <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="2"
              placeholder="e.g. Daily college coursework, family clothing, community library..."
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
              className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50 placeholder:text-charcoal-400"
            />
          </div>

          {/* Preferred Pickup & Contact Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Pickup Preference
              </label>
              <select
                value={preferredPickupMethod}
                onChange={(e) => setPreferredPickupMethod(e.target.value)}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
              >
                <option value="Self Pickup">Self Pickup (Local meet)</option>
                <option value="Courier / Delivery">Courier / Delivery</option>
                <option value="Community Drop-off Point">Community Drop-off Point</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Contact Preference
              </label>
              <select
                value={contactPreference}
                onChange={(e) => setContactPreference(e.target.value)}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
              >
                <option value="Platform Chat">Platform Chat (Recommended)</option>
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          {/* Additional Message */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Personal Note to Donor (Optional)
            </label>
            <input
              type="text"
              placeholder="A courteous greeting or timing flexibility..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
            />
          </div>

          {/* Price Calculation / Agreement Box */}
          <div className="p-3 bg-cream-100 rounded-xl border border-cream-300 flex items-center justify-between text-xs">
            <span className="font-medium text-charcoal-700">Total Agreed Contribution:</span>
            <span className="text-base font-bold text-forest-800">
              {isPaid ? `₹${totalPrice.toLocaleString()}` : '₹0 (FREE)'}
            </span>
          </div>

          {/* Anti-resale transparency pledge */}
          <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={antiResaleAgreed}
                onChange={(e) => setAntiResaleAgreed(e.target.checked)}
                className="mt-0.5 rounded text-forest-700 focus:ring-forest-600 w-4 h-4"
              />
              <span className="text-xs text-charcoal-700 leading-snug">
                <strong>Anti-Misuse Pledge:</strong> I declare under platform terms that I am requesting this item for genuine personal or community need. I will never resell or commercialize this donated item.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isDonorSelf}
              className={`px-5 py-2 text-xs font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
                submitting || isDonorSelf ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Submitting Request...' : 'Confirm & Send Request'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default RequestModal;
